package toykiwi.sanityCheck.reqDtos;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class MockTranslatingSubtitleCompletedReqDto {
    private Long videoId;
    private Long subtitleId;
    private String translatedSubtitle;
}
