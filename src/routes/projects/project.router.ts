import express from 'express';
import { asyncHandler, checkID } from '../../helpers';
import { fetchProjectStories, upsertProjectStory } from '../stories/story.controller';
import { parseStoryQueryParams, validateUpsertStory } from '../stories/story.middleware';
import { deleteProject, fetchProjects, fetchSpecificProject, updateProjectStatus, upsertProject } from './project.controller';
import { validateSetStatus, parseProjectQueryParams, validateUpsertProject } from './project.middleware';

const router = express.Router();

router.route("/")
    .get(parseProjectQueryParams, asyncHandler(fetchProjects))
    .post(validateUpsertProject, asyncHandler(upsertProject))

router.route("/:projectID")
    .get(checkID('projectID'), asyncHandler(fetchSpecificProject))
    .put(checkID('projectID'), validateUpsertProject, asyncHandler(upsertProject))
    .delete(checkID('projectID'), asyncHandler(deleteProject))

router.route("/:projectID/set_status")
    .put(checkID('projectID'), validateSetStatus, asyncHandler(updateProjectStatus))

router.route("/:projectID/stories")
    .get(checkID('projectID'), parseStoryQueryParams, asyncHandler(fetchProjectStories))
    .post(checkID('projectID'), validateUpsertStory, asyncHandler(upsertProjectStory))

export default router
