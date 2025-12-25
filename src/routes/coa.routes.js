import express from "express";
import { queue } from "../queues/coa.queue.js";
import { sendCoaToNas } from "../services/coa.service.js";
import { delay } from "../utils/delay.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * Kick user (bebas NAS)
 */
router.post("/kick-per-nas", async (req, res) => {
  const users = req.body.users || [];

  for (const user of users) {
    logger.info("QUEUE_ADD", {
      type: "single",
      nas: user.nas,
      username: user.username,
    });

    queue.add(async () => {
      try {
        await sendCoaToNas(user.nas, user.username, user.sessionid);
      } catch (err) {
        logger.error("QUEUE_JOB_ERROR", {
          nas: user.nas,
          username: user.username,
          error: err.message,
        });
      }
    });
  }

  res.json({
    status: "queued",
    total: users.length,
  });
});

/**
 * Kick user grouped per NAS
 */
router.post("/kick-multi-nas", async (req, res) => {
  const users = req.body.users || [];
  const groupedByNas = new Map();

  for (const user of users) {
    if (!groupedByNas.has(user.nas)) {
      groupedByNas.set(user.nas, []);
    }
    groupedByNas.get(user.nas).push(user);
  }

  for (const [nas, userList] of groupedByNas.entries()) {
    logger.info("NAS_JOB_ENQUEUE", {
      nas,
      users: userList.length,
    });

    const job = async () => {
      logger.info("NAS_JOB_START", {
        nas,
        users: userList.length,
      });

      for (const user of userList) {
        try {
          logger.info("COA_PROCESS", {
            nas,
            username: user.username,
          });

          await sendCoaToNas(nas, user.username, user.sessionid);
          await delay(100);
        } catch (err) {
          logger.error("COA_PROCESS_ERROR", {
            nas,
            username: user.username,
            error: err.message,
          });
        }
      }

      logger.info("NAS_JOB_DONE", { nas });
    };

    queue.add(job);
  }

  res.json({
    status: "queued",
    nas_total: groupedByNas.size,
    users_total: users.length,
  });
});

export default router;
