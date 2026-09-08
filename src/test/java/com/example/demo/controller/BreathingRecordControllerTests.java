package com.example.demo.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;

import com.example.demo.dto.BreathingRecordForm;
import com.example.demo.entity.BreathingRecord;
import com.example.demo.service.BreathingRecordService;

class BreathingRecordControllerTests {

    @Test
    void validInputRedirectsToTheSavedRecord() {
        BreathingRecordService service = mock(BreathingRecordService.class);
        BreathingRecord saved = new BreathingRecord();
        saved.setId(42L);
        when(service.save(any(BreathingRecord.class))).thenReturn(saved);
        BreathingRecordForm form = validForm();
        BeanPropertyBindingResult result = new BeanPropertyBindingResult(form, "recordForm");

        String view = new BreathingRecordController(service).save(form, result);

        assertThat(view).isEqualTo("redirect:/breathing/timer/42");
        verify(service).save(any(BreathingRecord.class));
    }

    @Test
    void invalidInputReturnsTheFormWithoutSaving() {
        BreathingRecordService service = mock(BreathingRecordService.class);
        BreathingRecordForm form = validForm();
        BeanPropertyBindingResult result = new BeanPropertyBindingResult(form, "recordForm");
        result.addError(new FieldError("recordForm", "inhaleSeconds", "範囲外です"));

        String view = new BreathingRecordController(service).save(form, result);

        assertThat(view).isEqualTo("breathing/form");
        verify(service, never()).save(any());
    }

    private BreathingRecordForm validForm() {
        BreathingRecordForm form = new BreathingRecordForm();
        form.setInhaleSeconds(4);
        form.setHoldSeconds(0);
        form.setExhaleSeconds(6);
        form.setCycleCount(5);
        return form;
    }
}
