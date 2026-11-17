package com.example.delivery.service.impl;

import com.example.delivery.dto.request.CustomerRequest;
import com.example.delivery.dto.response.CustomerResponse;
import com.example.delivery.dto.response.PageResponse;
import com.example.delivery.entity.Customer;
import com.example.delivery.exception.ConflictException;
import com.example.delivery.exception.ResourceNotFoundException;
import com.example.delivery.mapper.CustomerMapper;
import com.example.delivery.repository.CustomerRepository;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final CustomerMapper mapper;

    @Override
    public PageResponse<CustomerResponse> search(String q, Pageable pageable) {
        Page<Customer> page = StringUtils.hasText(q)
                ? customerRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q.trim(), q.trim(), pageable)
                : customerRepository.findAll(pageable);
        return PageResponse.from(page.map(mapper::toResponse));
    }

    @Override
    public CustomerResponse get(Long id) {
        return mapper.toResponse(find(id));
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        apply(customer, request);
        return mapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = find(id);
        apply(customer, request);
        return mapper.toResponse(customer);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Customer customer = find(id);
        if (orderRepository.existsByCustomerId(id)) {
            throw new ConflictException("Ce client possède des commandes et ne peut pas être supprimé");
        }
        customerRepository.delete(customer);
    }

    private Customer find(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client", id));
    }

    private void apply(Customer c, CustomerRequest r) {
        c.setName(r.name().trim());
        c.setEmail(r.email().trim());
        c.setPhone(r.phone().trim());
        c.setAddress(r.address().trim());
    }
}
