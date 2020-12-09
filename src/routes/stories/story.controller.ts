import { Request, Response } from "express";
import { getConnection, getManager, getRepository, ILike } from "typeorm";
import Story from "../../entity/Story";
import StoryOwner from "../../entity/StoryOwner";
import { findEntityDocByID, omit, storyOwnerList } from "../../helpers";

const storyRepo = () => getRepository(Story)

export const fetchProjectStories = async (req: Request, res: Response) => {
    const { projectID } = req.params
    const { keyword, status, type, page } = req.query
    // @ts-ignore
    const skip: number = (page - 1) * 6
    let whereClause = {}
    whereClause = (keyword) ? { ...whereClause, title: ILike(`%${keyword}%`) } : whereClause
    whereClause = (status) ? { ...whereClause, status } : whereClause
    whereClause = (type) ? { ...whereClause, type } : whereClause
    whereClause = { ...whereClause, project: { project_id: projectID } }

    const [project_stories, total_count] = await storyRepo().findAndCount({
        select: ['story_id', 'title', 'type', 'points', 'description', 'status', 'updated_at'],
        where: whereClause,
        order: { created_at: 'DESC' },
        skip: skip,
        take: 6,
    })
    const getStoryOwnerQuery = `
        select u.user_id, u.fullname, u.username, so.created_at as assigned_at
        from story_owners so
        inner join users u on so.user_id = u.user_id and so.story_id = $1
        order by so.created_at desc;
    `
    for (const idx in project_stories) { // attach owners to each story
        const { story_id } = project_stories[idx]
        const storyOwners = await getManager().query(getStoryOwnerQuery, [story_id])
        project_stories[idx].owners = storyOwners
    }
    res.status(200).json({ total_count, project_stories })
}

export const upsertProjectStory = async (req: Request, res: Response) => {
    const { title, type, points, description, owner_ids } = req.body
    const { projectID, storyID } = req.params
    let story = new Story()
    let result

    if (projectID) {// POST --> /projects/:projectID/stories
        result = await getConnection().createQueryBuilder().insert().into(Story)
            .values(Object.assign(story, {
                title, type, points, description, project: { project_id: projectID }
            })).execute()
        // Add story owners if provided...
        if (owner_ids.length > 0) await getConnection().createQueryBuilder().insert().into(StoryOwner)
            .values(storyOwnerList(result.identifiers[0].story_id, owner_ids)).execute()
    }
    if (storyID) { // PUT --> /stories/:storyID
        story = await findEntityDocByID(storyRepo(), storyID)
        storyRepo().merge(story, { title, type, points, description })
        story = await storyRepo().save(story)
    }
    res.status(200).json(omit(story, ['created_at']))
}

export const addStoryOwner = async (req: Request, res: Response) => {
    const { storyID } = req.params
    const { owner_id } = req.body
    await getConnection().createQueryBuilder().insert().into(StoryOwner)
        .values({ story: { story_id: storyID }, owner: { user_id: owner_id } }).execute()
    res.status(204).json()
}

export const removeStoryOwner = async (req: Request, res: Response) => {
    const { storyID, ownerID } = req.params
    await getConnection().createQueryBuilder().delete().from(StoryOwner)
        .where('story_id = :sid', { sid: storyID }).andWhere('user_id = :uid', { uid: ownerID }).execute()
    res.status(204).json()
}

export const setStoryStatus = async (req: Request, res: Response) => {
    const { status } = req.body
    const { storyID } = req.params

    const story = await findEntityDocByID(storyRepo(), storyID)
    storyRepo().merge(story, { status })
    await storyRepo().save(story)
    res.status(204).json()
}
