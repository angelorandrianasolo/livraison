package com.example.delivery.service;

import com.example.delivery.dto.request.ZoneRequest;
import com.example.delivery.dto.response.ZoneResponse;
import java.util.List;

public interface ZoneService {
    List<ZoneResponse> findAll();

    ZoneResponse create(ZoneRequest request);

    ZoneResponse update(Long id, ZoneRequest request);

    void delete(Long id);
}
