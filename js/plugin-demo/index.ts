import {FlowPlugin} from "../flow-launcher-extended-plugin/src";
import {log} from "../flow-launcher-extended-plugin/src/utils"

type MdnArticle = {
  title: string;
  url: string;
}

@FlowPlugin.Class
export class MyPlugin extends FlowPlugin {
  private readonly openMdnUrlPrefix = "https://developer.mozilla.org";
  private readonly mdnIndexUrl = "https://developer.mozilla.org/en-US/search-index.json";

  private data: MdnArticle[] = [];

  @FlowPlugin.Init
  async init() {
    log("pluginMetadata", this.metadata);
    // this.data = await this.api.httpGetJson(this.mdnIndexUrl);
  }

  // @FlowPlugin.Search
  // async hello(query: Query): Promise<SearchResults> {
  //   const time = performance.now();
  //   await Promise.all(this.data.map(v => this.api.fuzzySearch(query.search, v.title)));
  //   const timeTaken = performance.now() - time;
  //   return {
  //     title: `Time taken: ${timeTaken}ms`,
  //     subtitle: `Elements searched: ${this.data.length}`,
  //   };
  // }

  @FlowPlugin.Search
  async hello(query: Query): Promise<SearchResults> {

    return {
      title: "Autocomplete demo",
    };
  }
}
