import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@mui/material';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Stack from '@mui/material/Stack';
import APIConfig from '../../../APIConfig';
import { AlertPopupContext } from '../../../_global/alertPopUp/AlertPopUpContext'
import CuttedVideoPlayer from './CuttedVideoPlayer';
import VideoQuizTryAppBar from './VideoQuizTryAppBar';
import VideoQuizCard from './VideoQuizCard';

// 예시 URL: http://localhost:3000/video/quiz/try?videoId=1
const VideoQuizTryPage = () => {
    const {addAlertPopUp} = useContext(AlertPopupContext);
    const [queryParameters] = useSearchParams()
    const navigate = useNavigate();


    const [uploadVideoInfo, setUploadVideoInfo] = useState({});
    const [subtitleInfos, setSubtitleInfos] = useState([])
    const [videoPlayerProps, setVideoPlayerProps] = useState({})
    useEffect(() => {
        (async () => {
            try {

                const response = await axios.get(`${APIConfig.collectedDataUrl}/videos/${queryParameters.get("videoId")}`);
                setUploadVideoInfo({
                    videoId: response.data.videoId,
                    uploadedUrl: response.data.uploadedUrl
                })

            } catch (error) {
                addAlertPopUp("업로된 동영상 정보를 가져오는 과정에서 오류가 발생했습니다!", "error");
                console.error("업로된 동영상 정보를 가져오는 과정에서 오류가 발생했습니다!", error);
            }

            try {

                const response = await axios.get(`${APIConfig.collectedDataUrl}/videos/${queryParameters.get("videoId")}/subtitles`);
                setSubtitleInfos(response.data.subtitles.map((subtitle) => {
                    return {
                        subtitleId: subtitle.subtitleId,
                        subtitle: subtitle.subtitle,
                        translatedSubtitle: subtitle.translatedSubtitle,
                        startSecond: subtitle.startSecond,
                        endSecond: subtitle.endSecond
                    }
                }))

            } catch (error) {
                addAlertPopUp("업로된 동영상 자막 정보를 가져오는 과정에서 오류가 발생했습니다!", "error");
                console.error("업로된 동영상 자막 정보를 가져오는 과정에서 오류가 발생했습니다!", error);
            }
        })()
    }, [addAlertPopUp, queryParameters])

    useEffect(() => {
        setVideoPlayerProps({
            url: uploadVideoInfo.uploadedUrl,
            currentTimeIndex: 0,
            limitedTimeIndex: 0,
            timeRanges: subtitleInfos.map((subtitleInfo) => {
                return {
                    startTimeSec: subtitleInfo.startSecond,
                    endTimeSec: subtitleInfo.endSecond
                }
            })
        })
    }, [uploadVideoInfo, subtitleInfos])

    const onClickPrevButton = () => {
        if(videoPlayerProps.currentTimeIndex === 0) {
          return
        }
    
        setVideoPlayerProps((videoPlayerProps) => {
          return {
            ...videoPlayerProps,
            currentTimeIndex: videoPlayerProps.currentTimeIndex-1
          }
        })
      }
    
      const onClickNextButton = () => {
        if(videoPlayerProps.currentTimeIndex >= videoPlayerProps.limitedTimeIndex) return
        if(videoPlayerProps.currentTimeIndex === videoPlayerProps.timeRanges.length-1) {
            navigate(`/video/quiz/result?videoId=${queryParameters.get("videoId")}&correctedWordCount=${quizResultInfo.correctedWordCount}&inCorrectedWordCount=${quizResultInfo.inCorrectedWordCount}`)
            return
        }
    
        setVideoPlayerProps((videoPlayerProps) => {
            return {
            ...videoPlayerProps,
            currentTimeIndex: videoPlayerProps.currentTimeIndex+1
            }
        })
    }
    

    const [quizInfo, setQuizInfo] = useState()
    const [quizResultInfo, setQuizResultInfo] = useState({
        correctedWordCount: 0,
        inCorrectedWordCount: 0
    })

    useEffect(() => {
        if(!(subtitleInfos && subtitleInfos.length > 0)) return

        setQuizInfo({
            words: subtitleInfos[videoPlayerProps.currentTimeIndex].subtitle.split(" "),
            translatedSubtitle: subtitleInfos[videoPlayerProps.currentTimeIndex].translatedSubtitle
        })
        
    }, [subtitleInfos, videoPlayerProps.currentTimeIndex])

    const onAllCorrect = (currentCorrectedWordCount, currentInCorrectedWordCount) => {
        setVideoPlayerProps((videoPlayerProps) => {
            return {
              ...videoPlayerProps,
              limitedTimeIndex: videoPlayerProps.limitedTimeIndex+1
            }
          })
        
        setQuizResultInfo((quizResultInfo) => {
            return {
                correctedWordCount: quizResultInfo.correctedWordCount + currentCorrectedWordCount,
                inCorrectedWordCount: quizResultInfo.inCorrectedWordCount + currentInCorrectedWordCount
            }
        })
        console.log("CURRENT RESULT: ", quizResultInfo)
    }

    return (
        <>
        <VideoQuizTryAppBar/>

        {
            (() => {
                if (videoPlayerProps.url && videoPlayerProps.timeRanges && 
                   (videoPlayerProps.timeRanges.length > 0) && quizInfo) {
                    return (
                        <>
                        <Stack spacing={0.5} sx={{marginTop: 1}}>
                            <Card variant="outlined">
                                <CuttedVideoPlayer url={videoPlayerProps.url} currentTimeIndex={videoPlayerProps.currentTimeIndex} timeRanges={videoPlayerProps.timeRanges}/>
                            </Card>
                            
                            <Card variant="outlined">
                                <Button onClick={onClickPrevButton} sx={{float:"left", color: "black"}}>
                                    <SkipPreviousIcon/>
                                </Button>
                                {
                                    (videoPlayerProps.currentTimeIndex >= videoPlayerProps.limitedTimeIndex) ? (
                                        <Button onClick={onClickNextButton} sx={{float: "right", color: "black"}} disabled>
                                            <SkipNextIcon/>
                                        </Button>
                                    ) : (
                                        <Button onClick={onClickNextButton} sx={{float: "right", color: "black"}}>
                                            <SkipNextIcon/>
                                        </Button>
                                    )

                                }
                            </Card>

                            <VideoQuizCard videoPlayerProps={videoPlayerProps} subtitleInfos={subtitleInfos}
                                           quizInfo={quizInfo} onAllCorrect={onAllCorrect}/>
                        </Stack>
                        </>
                    )
                }
            })()
        }
        </>
    );
}

export default VideoQuizTryPage;