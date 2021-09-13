import DataLoader from "dataloader";
import { Page } from "../entities/Page";

export const createPostLoader = () => new DataLoader<number, Page>(async (pageIds) => {

    const pageUsers = await Page.findByIds(pageIds as number[])

    const pageIdToPage: Record<number, Page> = {};

    pageUsers.forEach((u) => {
        pageIdToPage[u.id] = u;
    })

    const pageUserSorted = pageIds.map((pageId) => pageIdToPage[pageId]);

    return pageUserSorted;
});