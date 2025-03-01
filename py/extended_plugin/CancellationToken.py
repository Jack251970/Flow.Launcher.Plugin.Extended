class CancellationToken:
    def __init__(self):
        self.__cancelled = False

    def cancel(self):
        self.__cancelled = True

    @property
    def is_cancelled(self):
        return self.__cancelled