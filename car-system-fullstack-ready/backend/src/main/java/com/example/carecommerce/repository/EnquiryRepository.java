package com.example.carecommerce.repository;
import com.example.carecommerce.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EnquiryRepository extends JpaRepository<Enquiry,Long> {
    List<Enquiry> findByUserId(Long userId);
}
