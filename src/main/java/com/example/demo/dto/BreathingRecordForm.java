package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BreathingRecordForm {
    @NotNull(message = "吸う秒数を入力してください")
    @Min(value = 1, message = "吸う秒数は1秒以上で入力してください")
    @Max(value = 30, message = "吸う秒数は30秒以内で入力してください")
    private Integer inhaleSeconds;

    @NotNull(message = "止める秒数を入力してください")
    @Min(value = 0, message = "止める秒数は0秒以上で入力してください")
    @Max(value = 30, message = "止める秒数は30秒以内で入力してください")
    private Integer holdSeconds;

    @NotNull(message = "吐く秒数を入力してください")
    @Min(value = 1, message = "吐く秒数は1秒以上で入力してください")
    @Max(value = 30, message = "吐く秒数は30秒以内で入力してください")
    private Integer exhaleSeconds;

    @NotNull(message = "回数を入力してください")
    @Min(value = 1, message = "回数は1回以上で入力してください")
    @Max(value = 20, message = "回数は20回以内で入力してください")
    private Integer cycleCount;
}
