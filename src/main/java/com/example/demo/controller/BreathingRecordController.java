package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.entity.BreathingRecord;
import com.example.demo.service.BreathingRecordService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class BreathingRecordController {

    private final BreathingRecordService breathingRecordService;

    /** 入力画面表示 */
    @GetMapping("/breathing/new")
    public String showForm(Model model) {
        model.addAttribute("record", new BreathingRecord());
        return "breathing/form";
    }

    /** 保存（バリデーションあり） */
    @PostMapping("/breathing/save")
    public String save(
            @RequestParam Integer inhaleSeconds,
            @RequestParam Integer holdSeconds,
            @RequestParam Integer exhaleSeconds,
            @RequestParam Integer cycleCount) {

        BreathingRecord record = new BreathingRecord();
        record.setInhaleSeconds(inhaleSeconds);
        record.setHoldSeconds(holdSeconds);
        record.setExhaleSeconds(exhaleSeconds);
        record.setCycleCount(cycleCount);

        breathingRecordService.save(record);

        // 保存後に最新の記録IDを取得してタイマー画面へリダイレクト
        Long latestId = record.getId(); // saveでIDがセットされている想定
        return "redirect:/breathing/timer/" + latestId;
    }


    /** 一覧表示 */
    @GetMapping("/breathing/list")
    public String showList(Model model) {
        model.addAttribute("records",
                breathingRecordService.findAllRecords());
        return "breathing/list";
    }
    
 // -------------------------------
    // タイマー画面
    // -------------------------------
    @GetMapping("/breathing/timer/{id}")
    public String showTimer(@PathVariable Long id, Model model) {
        BreathingRecord record = breathingRecordService.findById(id);
        if (record == null) {
            return "redirect:/breathing/list";
        }
        model.addAttribute("record", record);
        return "breathing/timer"; // timer.html は templates/breathing/timer.html に置く
    }



}

