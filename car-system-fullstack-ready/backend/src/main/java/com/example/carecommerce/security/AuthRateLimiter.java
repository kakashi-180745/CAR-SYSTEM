package com.example.carecommerce.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class AuthRateLimiter {
    private static final int MAX_ATTEMPTS = 10;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean allow(String key) {
        Instant now = Instant.now();
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> new Bucket(now));
        synchronized (bucket) {
            if (Duration.between(bucket.startedAt, now).compareTo(WINDOW) >= 0) {
                bucket.startedAt = now;
                bucket.attempts.set(0);
            }
            if (bucket.attempts.incrementAndGet() > MAX_ATTEMPTS) {
                return false;
            }
        }
        if (buckets.size() > 5000) {
            buckets.entrySet().removeIf(e -> Duration.between(e.getValue().startedAt, now).compareTo(WINDOW) >= 0);
        }
        return true;
    }

    private static final class Bucket {
        private Instant startedAt;
        private final AtomicInteger attempts = new AtomicInteger();
        private Bucket(Instant startedAt) { this.startedAt = startedAt; }
    }
}
