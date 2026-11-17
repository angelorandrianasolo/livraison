package com.example.delivery.util;

public final class MathUtils {

    private MathUtils() {
    }

    public static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
