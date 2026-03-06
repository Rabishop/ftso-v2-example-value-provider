import { Injectable } from "@nestjs/common";
import { FeedId, FeedValueData, FeedVolumeData } from "./dto/provider-requests.dto";
import { BaseDataFeed } from "./data-feeds/base-feed";

@Injectable()
export class ExampleProviderService {
  constructor(private readonly dataFeed: BaseDataFeed) {}

  async getValue(feed: FeedId): Promise<FeedValueData> {
    return this.dataFeed.getValue(feed);
  }

  async getValues(feeds: FeedId[]): Promise<FeedValueData[]> {
    const raw = await this.dataFeed.getValues(feeds);
    return raw.filter((item): item is FeedValueData => typeof item.value === "number" && !Number.isNaN(item.value));
  }

  async getVolumes(feeds: FeedId[], volumeWindow: number): Promise<FeedVolumeData[]> {
    return this.dataFeed.getVolumes(feeds, volumeWindow);
  }
}
