package com.example.demo.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

class CycleCountMigrationTests {
    @Test
    void upgradesExistingH2DataAndEnforcesNewBoundary() throws Exception {
        String url = "jdbc:h2:mem:cycle-count-migration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("1").load().migrate();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            insert(connection, 20);
            assertThatThrownBy(() -> insert(connection, 30)).isInstanceOf(java.sql.SQLException.class);
        }

        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            for (int cycles : new int[] {1, 30, 60}) insert(connection, cycles);
            assertThatThrownBy(() -> insert(connection, 61)).isInstanceOf(java.sql.SQLException.class);
            try (ResultSet rows = connection.createStatement().executeQuery("SELECT cycle_count FROM breathing_records ORDER BY id")) {
                for (int expected : new int[] {20, 1, 30, 60}) {
                    assertThat(rows.next()).isTrue();
                    assertThat(rows.getInt(1)).isEqualTo(expected);
                }
                assertThat(rows.next()).isFalse();
            }
        }
    }

    private void insert(Connection connection, int cycles) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement("INSERT INTO breathing_records (inhale_seconds, hold_seconds, exhale_seconds, cycle_count, created_at) VALUES (4, 0, 6, ?, CURRENT_TIMESTAMP)")) {
            statement.setInt(1, cycles);
            statement.executeUpdate();
        }
    }
}
