import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { aiAtom, noUseAiAtom } from '../../core/atoms/aiState';
import useTimer from '../../utils/hooks/useTimer';
import { formatTime } from '../../utils/utils';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { RiTimerLine } from 'react-icons/ri';

import * as API from '../../pages/api/api';
import { getClientBuildManifest } from 'next/dist/client/route-loader';
// userIsHear가 true일 때 start
// false가 되면 pause
// 아예 창을 나가면 stop하고 reset
// 이 때 멈출 때마다 데이터를 저장한다.
// 저장한 데이터를 백엔드로 넘기기
const StopWatch = forwardRef(
  ({ myTimer, roomId, membersOnly, userT, cb }, ref = null) => {
    const { timer, handleStart, handlePause, handleRestart, getActiveTime } =
      useTimer(userT);

    // 카운트다운 시간 설정: 5초
    const initialMinute = 0;
    const initialSeconds = 5;
    const [minutes, setMinutes] = useState(initialMinute);
    const [seconds, setSeconds] = useState(initialSeconds);
    const [getReady, setGetReady] = useState(false);
    const [isPassTime, setIsPassTime] = useState(true);

    // timelog 찍을 때 사용
    const [startTime, setStartTime] = useState('0000-00-00 00:00:00');
    const [endTime, setEndTime] = useState('0000-00-00 00:00:00');

    const router = useRouter();

    // dayjs 한국 시간 설정
    dayjs.locale('ko');

    let Img = '/people-01.png';

    useEffect(() => {
      const ImgArr = ['/people-01.png', '/people-02.png'];

      function randomImgPicker(arr) {
        const random = Math.floor(Math.random() * arr.length);
        return arr[random];
      }

      Img = randomImgPicker(ImgArr);
    }, []);

    if (myTimer === true) {
      const [userIsHear, setUserIsHear] = useRecoilState(aiAtom);
      // const [noUseAi, setUserAiAtom] = useRecoilState(noUseAiAtom);

      if (ref != null) {
        useImperativeHandle(ref, () => ({
          // 뒤로 가기, 페이지를 나갈때도 timelogFunc 실행
          handleClick() {
            setEndTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
            timelogFunc();
            location.reload();
            router.back();
          },
          getTime() {
            return getActiveTime();
          },
        }));
      }

      // 처음 카운트다운 할 때 쓰는 코드
      useEffect(() => {
        let myInterval = setInterval(() => {
          if (seconds > 0) {
            setSeconds(seconds - 1);
          }
          if (seconds <= 0) {
            if (minutes <= 0) {
              clearInterval(myInterval);
              setGetReady(true);
            } else {
              setMinutes(minutes - 1);
              setSeconds(59);
            }
          }
        }, 1000);
        return () => {
          clearInterval(myInterval);
        };
      });

      // startTime, endTime 기록
      useEffect(() => {
        if (getReady && userIsHear) {
          handleRestart();
        } else if (getReady && !userIsHear) {
          handlePause();
          setEndTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        }
      }, [getReady, userIsHear]);

      //카운트다운 끝나고 타이머 start 시작 시간을 기록
      useEffect(() => {
        if (getReady) {
          handleStart();
          setStartTime(startTime);
        }
      }, []);

      // endTime이 변경될 때마다 timelog
      useEffect(() => {
        if (getReady) {
          timelogFunc();
        }
      }, [endTime]);

      // timelog 함수
      const timelogFunc = async () => {
        try {
          const res = await API.post('timelog', {
            startTime,
            endTime,
          });
          const updatedTimelog = await res.data;
        } catch (err) {}
      };
    } else {
      useImperativeHandle(ref, () => ({
        // 뒤로 가기, 페이지를 나갈때도 timelogFunc 실행
        setPassTime(time) {
          setIsPassTime(time);
        },
      }));

      useEffect(() => {
        if (isPassTime === true) {
          handleStart();
        } else {
          handlePause();
        }
      }, [isPassTime]);
    }

    const handleClick = () => {
      setEndTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      location.reload();
      router.back();
    };

    return (
      <div>
        {myTimer === false ? (
          <div>
            <div className="absolute z-10 flex justify-around">
              <div>
                <p className="bg-gray-100 text-gray-800 font-bold text-2xl inline-flex items-center px-2.5 py-0.5 rounded mr-2">
                  <RiTimerLine className="mr-3" />
                  {formatTime(timer)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="absolute flex justify-around">
                <div>
                  <p className="bg-gray-100 text-gray-800 font-bold text-2xl inline-flex items-center px-2.5 py-0.5 rounded mr-2">
                    <RiTimerLine className="mr-3" />
                    {formatTime(timer)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              {minutes === 0 && seconds === 0 ? null : (
                <div className="justify-center items-center text-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                  <div className="max-w-sm bg-white rounded-lg border border-gray-200 shadow-md">
                    <img className="rounded-t-lg" src={Img} alt="증명사진" />
                    <div className="p-5">
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                      </h5>
                      <p className="mb-3 font-normal text-gray-700">
                        5초 뒤에 타이머가 시작됩니다.
                        <br /> 웹 캠에{' '}
                        <span className="bg-amber-200">얼굴</span>과
                        <span className="bg-amber-200">상반신</span>이 잘
                        보이도록 설정해주세요.
                      </p>
                      <svg
                        role="status"
                        className="inline w-8 h-8 mr-2 text-white animate-spin fill-amber-400"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    </div>
                    <button
                      className="py-2.5 px-2.5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:bg-amber-400 hover:text-white hover:shadow-amber-300/50 focus:z-10 focus:ring-4 focus:ring-gray-200"
                      onClick={handleClick}
                    >
                      나가기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
);

export default StopWatch;
