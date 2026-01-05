package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "breathing_records")
public class BreathingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "吸う秒数を入力してください")
    @Min(value = 1, message = "吸う秒数は1秒以上で入力してください")
    @Max(value = 30, message = "吸う秒数は30秒以内で入力してください")
    @Column(name = "inhale_seconds", nullable = false)
    private Integer inhaleSeconds;

    @NotNull(message = "止める秒数を入力してください")
    @Min(value = 0, message = "止める秒数は0秒以上で入力してください")
    @Max(value = 30, message = "止める秒数は30秒以内で入力してください")
    @Column(name = "hold_seconds", nullable = false)
    private Integer holdSeconds;

    @NotNull(message = "吐く秒数を入力してください")
    @Min(value = 1, message = "吐く秒数は1秒以上で入力してください")
    @Max(value = 30, message = "吐く秒数は30秒以内で入力してください")
    @Column(name = "exhale_seconds", nullable = false)
    private Integer exhaleSeconds;

    @NotNull(message = "回数を入力してください")
    @Min(value = 1, message = "回数は1回以上で入力してください")
    @Max(value = 20, message = "回数は20回以内で入力してください")
    @Column(name = "cycle_count", nullable = false)
    private Integer cycleCount;

    @NotNull(message = "記録日時が不正です")
    @PastOrPresent(message = "未来の日時は指定できません")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
