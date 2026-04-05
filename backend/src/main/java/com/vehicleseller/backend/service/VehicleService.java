package com.vehicleseller.backend.service;

import com.vehicleseller.backend.model.Vehicle;
import com.vehicleseller.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id).orElse(null);
    }


    public Vehicle addVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle existingVehicle = vehicleRepository.findById(id).orElse(null);
        if (existingVehicle != null) {
            existingVehicle.setBrand(updatedVehicle.getBrand());
            existingVehicle.setModel(updatedVehicle.getModel());
            existingVehicle.setYear(updatedVehicle.getYear());
            existingVehicle.setPrice(updatedVehicle.getPrice());
            existingVehicle.setCondition(updatedVehicle.getCondition());

            existingVehicle.setImage(updatedVehicle.getImage());
            existingVehicle.setImage2(updatedVehicle.getImage2());
            existingVehicle.setImage3(updatedVehicle.getImage3());
            existingVehicle.setImage4(updatedVehicle.getImage4());
            existingVehicle.setImage5(updatedVehicle.getImage5());

            existingVehicle.setMileage(updatedVehicle.getMileage());
            existingVehicle.setFuelType(updatedVehicle.getFuelType());
            existingVehicle.setTransmission(updatedVehicle.getTransmission());
            existingVehicle.setEngine(updatedVehicle.getEngine());
            existingVehicle.setContact(updatedVehicle.getContact());
            existingVehicle.setDescription(updatedVehicle.getDescription());

            return vehicleRepository.save(existingVehicle);
        }
        return null;
    }
}