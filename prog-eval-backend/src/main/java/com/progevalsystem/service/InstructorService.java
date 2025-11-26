package com.progevalsystem.service;

import com.progevalsystem.entity.Instructor;
import com.progevalsystem.repository.InstructorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InstructorService {

    @Autowired
    private InstructorRepository instructorRepository;

    public List<Instructor> getAllInstructors() {
        return instructorRepository.findAll();
    }

    public Optional<Instructor> getInstructorById(Long id) {
        return instructorRepository.findById(id);
    }

    public Instructor createInstructor(Instructor instructor) {
        return instructorRepository.save(instructor);
    }

    public Instructor updateInstructor(Long id, Instructor instructorDetails) {
        return instructorRepository.findById(id).map(instructor -> {
            instructor.setInstructorId(instructorDetails.getInstructorId());
            instructor.setName(instructorDetails.getName());
            instructor.setEmail(instructorDetails.getEmail());
            instructor.setDepartment(instructorDetails.getDepartment());
            return instructorRepository.save(instructor);
        }).orElseThrow(() -> new RuntimeException("Instructor not found"));
    }

    public void deleteInstructor(Long id) {
        instructorRepository.deleteById(id);
    }

    public Optional<Instructor> getInstructorByInstructorId(String instructorId) {
        return instructorRepository.findByInstructorId(instructorId);
    }

    public Optional<Instructor> getInstructorByName(String name) {
        return instructorRepository.findByName(name);
    }

}
