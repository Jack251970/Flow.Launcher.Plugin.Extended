import logging
import sys
from typing import Any, List, TypedDict, Optional
import json
import inspect
import asyncio
from .ResultJsonEncoder import ResultJsonEncoder

logging.basicConfig(
    filename="D:/log/log.log",
    level=logging.INFO,
)

class Request(TypedDict):
    id: int
    method: Optional[str]
    error: Optional[str]
    result: Optional[Any]
    params: List[Any]

class _JsonRpcConnection:
    def __init__(self):
        self._id = 0
        self._requests = dict()
        self._pending_requests = dict()

    async def listen(self):
        for line in sys.stdin:
            await self._process_incoming_data(line)

    async def _process_incoming_data(self, data: str):
        try:
            logging.info("REQUEST:" + data)
            obj: Request = json.loads(data)
            if 'id' in obj and obj['id'] in self._pending_requests and 'method' not in obj:
                future = self._pending_requests[obj['id']]
                del self._pending_requests[obj['id']]

                if obj['error'] is not None:
                    future.set_exception(obj['error'])
                else:
                    future.set_result(obj['result'])
            else:
                await self._handle_request(obj)
        except:
            pass

    async def _handle_request(self, request: Request):
        logging.info("REQUEST:" + str(request))
        logging.info("REQUEST_ID:" + str('id' in request))
        if 'method' in request and request['method'] in self._requests:
            handler = self._requests[request['method']]
            if 'id' in request:
                try:
                    if inspect.iscoroutinefunction(handler):
                        result = await handler(*request['params'])
                    else:
                        result = handler(*request['params'])
                    self._send_response(request['id'], result)
                except Exception as e:
                    logging.error("ERROR:" + str(e))
                    self._send_error(request['id'], str(e))
            else:
                if inspect.iscoroutinefunction(handler):
                    await handler(*request['params'])
                else:
                    handler(*request['params'])
        else:
            if 'id' in request:
                self._send_response(request['id'], {'hi': 'hi'})

    def on_request(self, method: str, handler):
        self._requests[method] = handler

    def _send_response(self, id: int, result: Any):
        response = json.dumps({
            'jsonrpc': '2.0',
            'id': id,
            'result': result
        }, cls=ResultJsonEncoder)
        logging.info("RESPONSE:" + response)
        self._write_message(response)

    def _send_error(self, id: int, error: str):
        response = json.dumps({
            'jsonrpc': '2.0',
            'id': id,
            'error': { 'code': -32603, 'message': error}
        })
        self._write_message(response)

    async def send_request(self, method: str, params: List[Any]):
        request_id = self._id
        self._id += 1

        future = asyncio.get_running_loop().create_future()
        self._pending_requests[request_id] = future

        request_payload = json.dumps({
            'jsonrpc': '2.0',
            'id': request_id,
            'method': method,
            'params': params
        })

        self._write_message(request_payload)

        try:
            response = await future
            return response
        except Exception as e:
            raise e

    @staticmethod
    def _write_message(message: str):
        sys.stdout.write(message + '\n')
        sys.stdout.flush()