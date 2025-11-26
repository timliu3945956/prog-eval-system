package com.progevalsystem.service;

import com.progevalsystem.entity.Degree;
import com.progevalsystem.repository.DegreeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DegreeService {

    @Autowired
    private DegreeRepository degreeRepository;

    public List<Degree> getAllDegrees() {
        return degreeRepository.findAll();
    }

    public Optional<Degree> getDegreeById(Long id) {
        return degreeRepository.findById(id);
    }

    public Degree createDegree(Degree degree) {
        return degreeRepository.save(degree);
    }

    public Degree updateDegree(Long id, Degree degreeDetails) {
        return degreeRepository.findById(id).map(degree -> {
            degree.setName(degreeDetails.getName());
            degree.setLevel(degreeDetails.getLevel());
            return degreeRepository.save(degree);
        }).orElseThrow(() -> new RuntimeException("Degree not found"));
    }

    public void deleteDegree(Long id) {
        degreeRepository.deleteById(id);
    }

    public Optional<Degree> getDegreeByName(String name) {
        return degreeRepository.findByName(name);
    }

}
