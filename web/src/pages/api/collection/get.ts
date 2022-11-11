import { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../../server/db/client";
import { validateRequest } from "../../../utils/jwt";

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
  if (!(await validateRequest(req))) {
    return res.status(401).json({ error: "You are not logged in" });
  }

  const { searchUserId, collectionId } = req.query;

  if (!searchUserId && !collectionId) {
    return res
      .status(400)
      .json({ error: "No searchUserId or collectionId provided" });
  }

  if (Array.isArray(searchUserId) || Array.isArray(collectionId)) {
    return res
      .status(400)
      .json({ error: "Passed params cannot be a string array" });
  }

  prisma.collection
    .findMany({
      where: {
        id: collectionId || undefined,
        userId: searchUserId || undefined,
      },
      select: {
        id: true,
        name: true,
        posts: {
          select: {
            id: true,
            dateCreated: true,
            prompt: true,
            imageURL: true,
            author: {
              select: {
                name: true,
                id: true,
              },
            },
            likes: true,
          },
        },
      },
    })
    .then((collections) => {
      res.status(200).json({ collections });
    })
    .catch((err: Error) => {
      console.error(err.message);
      return res.status(500).json({ error: "Internal database error" });
    });
}
