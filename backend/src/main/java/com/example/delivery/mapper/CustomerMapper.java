package com.example.delivery.mapper;

import com.example.delivery.dto.response.CustomerResponse;
import com.example.delivery.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getEmail(), c.getPhone(), c.getAddress());
    }
}
