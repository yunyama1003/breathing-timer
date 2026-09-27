package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.Test;

import com.example.demo.dto.BreathingRecordForm;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

class BreathingApplicationTests {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsBoundaryValues() {
        for (int cycles : new int[] {1, 20, 30, 60}) {
            assertThat(validator.validate(form(1, 0, 1, cycles))).isEmpty();
        }
        assertThat(validator.validate(form(30, 30, 30, 60))).isEmpty();
    }

    @Test
    void rejectsValuesOutsideTheAllowedRange() {
        Set<ConstraintViolation<BreathingRecordForm>> violations = validator.validate(form(0, -1, 31, 61));
        assertThat(violations).hasSize(4);
    }

    @Test
    void rejectsMissingValues() {
        assertThat(validator.validate(new BreathingRecordForm())).hasSize(4);
    }

    private BreathingRecordForm form(Integer inhale, Integer hold, Integer exhale, Integer cycles) {
        BreathingRecordForm form = new BreathingRecordForm();
        form.setInhaleSeconds(inhale);
        form.setHoldSeconds(hold);
        form.setExhaleSeconds(exhale);
        form.setCycleCount(cycles);
        return form;
    }
}
