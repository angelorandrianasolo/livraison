package com.example.delivery.service;

import com.example.delivery.dto.request.CustomerRequest;
import com.example.delivery.dto.response.CustomerResponse;
import com.example.delivery.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    PageResponse<CustomerResponse> search(String q, Pageable pageable);

    CustomerResponse get(Long id);

    CustomerResponse create(CustomerRequest request);

    CustomerResponse update(Long id, CustomerRequest request);

    void delete(Long id);
}
