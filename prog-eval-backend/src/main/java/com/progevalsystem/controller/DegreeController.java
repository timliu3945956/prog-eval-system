package com.progevalsystem.controller;

import com.progevalsystem.entity.Degree;
import com.progevalsystem.service.DegreeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/degrees")
public class DegreeController {

    @Autowired
    private DegreeService degreeService;

    @GetMapping
    public List<Degree> getAllDegrees() {
        return degreeService.getAllDegrees();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Degree> getDegreeById(@PathVariable Long id) {
        return degreeService.getDegreeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Degree createDegree(@RequestBody Degree degree) {
        return degreeService.createDegree(degree);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Degree> updateDegree(@PathVariable Long id, @RequestBody Degree degreeDetails) {
        try {
            Degree updatedDegree = degreeService.updateDegree(id, degreeDetails);
            return ResponseEntity.ok(updatedDegree);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDegree(@PathVariable Long id) {
        degreeService.deleteDegree(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search/name")
    public ResponseEntity<Degree> getDegreeByName(@RequestParam String name) {
        return degreeService.getDegreeByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}
