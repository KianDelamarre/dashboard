package com.kiandelamarre.dashboard.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseInitialiser {

    @Bean
    public CommandLineRunner initialiseDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            String sql = """
                CREATE TABLE IF NOT EXISTS "links" (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    localip TEXT,
                    remoteip TEXT,
                    imgurl TEXT,\s
                    name TEXT,\s
                    "column" INTEGER,\s
                    "row" INTEGER DEFAULT 0
                );
            """;

            jdbcTemplate.execute(sql);
            System.out.println("Database schema initialized successfully!");
        };
    }
}