import * as API from '../../api/api';
import EditBoard from '../../../components/board/edit/EditBoard';
import EditStudyContent from '../../../components/board/edit/EditStudyContent';
import { useState, useRef, useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import {
  editroomAtom,
  edithashtagAtom,
} from '../../../core/atoms/createroomState';
import { useRouter } from 'next/router';
import { roomDefaultImg } from '../../../components/common/UseData';
import Alert from '../../../components/common/Alert';
import Helmet from '../../../components/layout/Helmet';

/** 스터디룸 edit 페이지
 * @component
 * @return studyroom/edit 페이지
 */
export default function Create() {
  const router = useRouter();
  const [room, setRoom] = useRecoilState(editroomAtom);
  const resetRoom = useResetRecoilState(editroomAtom);

  const [file, setFile] = useState(null);
  const [tempUrl, setTempURL] = useState(null);
  const [error, setError] = useState(false);
  const [hashtag, setHashTag] = useRecoilState(edithashtagAtom);

  const fileInput = useRef(null);

  // 프로필 이미지를 리셋하는 함수
  const handleResetProfileChange = (e) => {
    setRoom((prev) => {
      return {
        ...prev,
        roomImg: roomDefaultImg,
      };
    });
    setTempURL(roomDefaultImg);
    setFile(roomDefaultImg);
  };

  // 프로필 이미지 미리보기
  const handleUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setTempURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  useEffect(() => {
    const getInfo = async () => {
      const res = await API.get('studyroom', router.query.id);
      setRoom(res.data);
      setTempURL(res.data.roomImg);
      // setFile(res.data.roomIm);
      var tag = res.data.hashTags;
      for (var i = 0; i < tag.length; i++) {
        tag[i].replace(/(\s*)/g, '');
        console.log(tag[i]);
      }
      setHashTag(tag.join(' '));
    };

    if (router.isReady) {
      getInfo();
    }
  }, [router.isReady]);

  // 프로필 이미지 저장
  const submitHandler = async (e) => {
    e.preventDefault();
    const formD = new FormData();
    formD.append('roomImg', file);
    hashtag.replace(' ', '');
    const tag = hashtag.split('#');
    for (var i = 1; i < tag.length; i++) {
      tag[i] = '#' + tag[i];
    }
    tag.shift();
    try {
      const res = await API.put('studyroom', {
        roomId: room.roomId,
        roomName: room.roomName,
        endStudyDay: room.endStudyDay,
        focusTimeStart: room.focusTimeStart,
        focusTimeEnd: room.focusTimeEnd,
        roomTitle: room.roomTitle,
        roomDesc: room.roomDesc,
        hashTags: tag,
      });
      console.log('방의 정보가 변경되었습니다.');
      if (file) {
        await API.putImg(`roomimg/${res.data.roomId}`, formD);
        console.log('이미지가 추가되었습니다.');
      }
      router.back();
      resetRoom();
    } catch (err) {
      console.log(err);
      setError(true);
    }
  };

  const resetHandler = () => {
    resetRoom();
    router.back();
  };
  return (
    <div className="container">
      <Helmet title="EDIT" />
      <div className="flex justify-center">
        <div className="container mx-72 bg-white rounded min-w-[440px]">
          <div className="w-full border-b border-amber-400  py-3 bg-white ">
            <div className="flex w-11/12 mx-auto xl:w-full xl:mx-0 items-center">
              <p className="text-2xl text-amber-400 font-bold">스터디방 수정</p>
            </div>
          </div>
          <div className="flex gap-x-6 m-2 rounded min-w-[440px]">
            <label
              htmlFor="name"
              className="pt-2 text-sm font-bold text-gray-800 "
            >
              대표 이미지 설정
            </label>
            {!error ? (
              <p className="pt-2 text-sm text-gray-800 ">
                대표 이미지를 설정해주세요.
              </p>
            ) : (
              <p className="pt-2 text-sm text-red-500 ">
                대표 이미지를 설정해주세요.
              </p>
            )}
          </div>
          <div className="container w-full mx-auto my-3 bg-white rounded flex-row justify-center">
            {tempUrl && (
              <div className="my-3">
                <img
                  className="object-fill h-48 w-96 rounded-md "
                  src={tempUrl}
                  alt="Rounded avatar"
                />
              </div>
            )}
            <input
              type="file"
              style={{ display: 'none' }}
              accept="image/jpg,image/png,image/jpeg"
              name="profile_img"
              onChange={handleUpload}
              ref={fileInput}
            />
            <div className="flex w-64 gap-x-3">
              <button
                className="w-full text-white py-2 px-2 my-1 uppercase rounded bg-amber-400 hover:bg-amber-500 shadow hover:shadow-lg text-sm transition duration-200"
                onClick={() => {
                  fileInput.current.click();
                }}
              >
                프로필 업로드
              </button>
              <button
                className="w-full text-amber-400 hover:text-white py-2 px-2 my-1 uppercase rounded border border-amber-400 bg-white hover:bg-amber-500 shadow hover:shadow-lg text-sm transition duration-200"
                onClick={handleResetProfileChange}
              >
                프로필 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <EditStudyContent />
      </div>
      <div className="flex justify-center mt-2">
        <EditBoard />
      </div>
      {error && (
        <div className="m-10">
          <Alert title="error" content="대표 이미지를 설정해주세요!" />
        </div>
      )}
      <div className="container mx-auto w-11/12 xl:w-full">
        <div className="w-full py-4 sm:px-0 bg-white  flex justify-center">
          <button
            role="button"
            aria-label="cancel form"
            className="bg-white focus:outline-none transition duration-150 ease-in-out hover:bg-amber-500 border-amber-400 hover:text-white border rounded text-amber-400  px-6 py-2 text-xs mr-4 focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            onClick={resetHandler}
          >
            Cancel
          </button>
          <button
            className="focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 bg-amber-400 focus:outline-none transition duration-150 ease-in-out hover:bg-amber-500 rounded text-white px-8 py-2 text-sm"
            onClick={submitHandler}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
