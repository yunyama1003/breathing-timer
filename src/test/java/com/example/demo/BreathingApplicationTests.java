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
        BreathingRecordForm form = form(1, 0, 1, 1);
        assertThat(validator.validate(form)).isEmpty();

        form = form(30, 30, 30, 20);
        assertThat(validator.validate(form)).isEmpty();
    }

    @Test
    void rejectsValuesOutsideTheAllowedRange() {
        Set<ConstraintViolation<BreathingRecordForm>> violations = validator.validate(form(0, -1, 31, 21));
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
