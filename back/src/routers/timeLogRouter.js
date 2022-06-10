import { Router } from 'express';
import { login_required } from '../middlewares/login_required';
import { timeLogService } from '../services/timeLogService';

const timeLogRouter = Router();

timeLogRouter.post('/timelog', login_required, async function (req, res, next) {
    try {
        // req (request) 에서 데이터 가져오기
        const user_id = req.body.id;
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        console.log(user_id, startTime, endTime);

        // 위 데이터를 유저 db에 추가하기
        const newLog = await timeLogService.addTimeLog({
            user_id,
            startTime,
            endTime,
        });

        if (newLog.errorMessage) {
            throw new Error(newLog.errorMessage);
        }

        res.status(201).json(newLog);
    } catch (error) {
        next(error);
    }
});

timeLogRouter.get('/timelogs', login_required, async function (req, res, next) {
    try {
        const user_id = req.body.id;
        const date = req.body.date;
        // YYYY-MM-DD
        // 0123456789
        if (!user_id) {
            const errorMessage = '아이디가 제대로 넘어오지 않았습니다.';
            return errorMessage;
        }
        if (!date) {
            const errorMessage = '날짜가 제대로 넘어오지 않았습니다';
            return errorMessage;
        }

        const logList = await timeLogService.getTimeLogs({ user_id, date });

        if (logList.errorMessage) {
            throw new Error(logList.errorMessage);
        }

        res.status(200).json(logList);
    } catch (error) {
        next(error);
    }
});

export { timeLogRouter };
