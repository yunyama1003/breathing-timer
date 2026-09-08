package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.BreathingRecord;
import com.example.demo.repository.BreathingRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BreathingRecordService {

    private final BreathingRecordRepository repository;

    public BreathingRecord save(BreathingRecord record) {
        return repository.save(record);
    }

    public List<BreathingRecord> findAllRecords() {
        return repository.findAllByOrderByCreatedAtDescIdDesc();
    }
    public BreathingRecord findLatest() {
        return repository.findTopByOrderByCreatedAtDesc();
    }

    public BreathingRecord findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
