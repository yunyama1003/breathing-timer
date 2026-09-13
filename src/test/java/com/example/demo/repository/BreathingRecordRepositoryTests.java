package com.example.demo.repository;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.BreathingRecord;

@SpringBootTest
@Transactional
class BreathingRecordRepositoryTests {

    @Autowired
    private BreathingRecordRepository repository;

    @Test
    void flywayCreatesSchemaAndRecordCanBeStored() {
        BreathingRecord record = new BreathingRecord();
        record.setInhaleSeconds(4);
        record.setHoldSeconds(0);
        record.setExhaleSeconds(6);
        record.setCycleCount(5);

        BreathingRecord saved = repository.saveAndFlush(record);

        assertThat(saved.getId()).isNotNull();
        assertThat(repository.findById(saved.getId())).contains(saved);
    }
}
