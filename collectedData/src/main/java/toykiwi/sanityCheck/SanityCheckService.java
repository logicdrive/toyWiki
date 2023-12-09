package toykiwi.sanityCheck;

import toykiwi._global.event.GeneratedSubtitleUploaded;
import toykiwi._global.event.SubtitleMetadataUploaded;
import toykiwi._global.event.TranlatedSubtitleUploaded;
import toykiwi._global.event.VideoUploadRequested;
import toykiwi._global.event.VideoUrlUploaded;
import toykiwi._global.logger.CustomLogger;
import toykiwi._global.logger.CustomLoggerType;

import toykiwi.sanityCheck.reqDtos.LogsReqDto;
import toykiwi.sanityCheck.reqDtos.MockGeneratedSubtitleUploadedReqDto;
import toykiwi.sanityCheck.reqDtos.MockSubtitleMetadataUploadedReqDto;
import toykiwi.sanityCheck.reqDtos.MockTranlatedSubtitleUploadedReqDto;
import toykiwi.sanityCheck.reqDtos.MockVideoUploadRequestedReqDto;
import toykiwi.sanityCheck.reqDtos.MockVideoUrlUploadedReqDto;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.springframework.stereotype.Service;

@Service
public class SanityCheckService {
    private final String logFilePath = "./logs/logback.log";

    // 출력된 로그들 중에서 끝부분 몇라인을 읽어서 반환시키기 위해서
    public List<String> logs(LogsReqDto logsReqDto) throws FileNotFoundException {
            List<String> logs = new ArrayList<>();

            try {
                
                CustomLogger.debug(CustomLoggerType.EFFECT, "Try to read logs", String.format("{filePath: %s}", logFilePath));
                
                Scanner myReader = new Scanner(new File(logFilePath));
                while (myReader.hasNextLine())
                {
                    String readLog = myReader.nextLine();
                    if (logsReqDto.getRegFilter().isEmpty()) logs.add(readLog);
                    else if(readLog.matches(logsReqDto.getRegFilter())) logs.add(readLog);
                }
                myReader.close();
                
                CustomLogger.debug(CustomLoggerType.EFFECT, "Read logs", String.format("{logsSize: %d}", logs.size()));

            } catch (FileNotFoundException e) {
                CustomLogger.error(e, "Error while reading logs", String.format("{filePath: %s}", logFilePath));
                throw new FileNotFoundException();
            }

            return logs.subList(Math.max(logs.size()-logsReqDto.getLineLength(), 0), logs.size());
    }


    // Policy 테스트용으로 VideoUploadRequested 이벤트를 강제로 발생시키기 위해서
    public void mockVideoUploadRequested(MockVideoUploadRequestedReqDto mockData) {
        (new VideoUploadRequested(mockData)).publish();
    }

    // Policy 테스트용으로 VideoUrlUploaded 이벤트를 강제로 발생시키기 위해서
    public void mockVideoUrlUploaded(MockVideoUrlUploadedReqDto mockData) {
        (new VideoUrlUploaded(mockData)).publish();
    }

    // Policy 테스트용으로 SubtitleMetadataUploaded 이벤트를 강제로 발생시키기 위해서
    public void mockSubtitleMetadataUploaded(MockSubtitleMetadataUploadedReqDto mockData) {
        (new SubtitleMetadataUploaded(mockData)).publish();
    }

    // Policy 테스트용으로 GeneratedSubtitleUploaded 이벤트를 강제로 발생시키기 위해서
    public void mockGeneratedSubtitleUploaded(MockGeneratedSubtitleUploadedReqDto mockData) {
        (new GeneratedSubtitleUploaded(mockData)).publish();
    }

    // Policy 테스트용으로 TranlatedSubtitleUploaded 이벤트를 강제로 발생시키기 위해서
    public void mockTranlatedSubtitleUploaded(MockTranlatedSubtitleUploadedReqDto mockData) {
        (new TranlatedSubtitleUploaded(mockData)).publish();
    }
}
