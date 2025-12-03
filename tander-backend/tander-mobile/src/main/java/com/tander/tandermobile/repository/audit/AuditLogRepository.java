package com.tander.tandermobile.repository.audit;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditLog;
import com.tander.tandermobile.domain.audit.AuditStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByUsername(String username);

    List<AuditLog> findByEventType(AuditEventType eventType);

    List<AuditLog> findByStatus(AuditStatus status);

    List<AuditLog> findByUserIdAndEventType(Long userId, AuditEventType eventType);

    @Query("SELECT a FROM AuditLog a WHERE a.userId = :userId AND a.createdAt BETWEEN :startDate AND :endDate")
    List<AuditLog> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );

    @Query("SELECT a FROM AuditLog a WHERE a.eventType = :eventType AND a.createdAt BETWEEN :startDate AND :endDate")
    List<AuditLog> findByEventTypeAndDateRange(
            @Param("eventType") AuditEventType eventType,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );

    @Query("SELECT a FROM AuditLog a WHERE a.status = :status AND a.createdAt >= :since")
    List<AuditLog> findFailedEventsSince(
            @Param("status") AuditStatus status,
            @Param("since") Date since
    );
}
