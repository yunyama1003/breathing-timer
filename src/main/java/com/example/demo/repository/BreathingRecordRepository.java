package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.BreathingRecord;

public interface BreathingRecordRepository
        extends JpaRepository<BreathingRecord, Long> {
	// 作成日時が一番新しい1件を取得
    BreathingRecord findTopByOrderByCreatedAtDesc();

    List<BreathingRecord> findAllByOrderByCreatedAtDescIdDesc();
}
