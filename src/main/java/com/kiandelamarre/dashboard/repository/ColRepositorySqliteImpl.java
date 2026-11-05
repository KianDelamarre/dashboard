package com.kiandelamarre.dashboard.repository;


import com.kiandelamarre.dashboard.dto.ColumnDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class ColRepositorySqliteImpl implements ColRepository{

    private final JdbcTemplate jdbcTemplate;

    public ColRepositorySqliteImpl(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ColumnDto> colRowMapper = (rs, rowNum) -> {
        ColumnDto col = new ColumnDto();
        col.setId(rs.getInt("id"));
        col.setName(rs.getString("name"));

        return col;
    };

    @Override
    public List<ColumnDto> findAll(){
        String sql = "SELECT * FROM cols";
        return jdbcTemplate.query(sql, colRowMapper);
    }

    @Override
    public ColumnDto findById(int id) {
        String sql = "SELECT * FROM cols WHERE id = ?";
        // Use query status with rowMapper, and fetch a single result or list
        List<ColumnDto> columns = jdbcTemplate.query(sql, colRowMapper, id);
        return columns.isEmpty() ? null : columns.get(0);
    }

    @Override
    public ColumnDto insert(ColumnDto column) {
        final String sql = "INSERT INTO cols (name) VALUES (?)";

        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update((Connection conn) -> {
            PreparedStatement statement = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, column.getName());
            return statement;
        }, keyHolder);

        // Set the generated ID back onto the column object before returning
        if (keyHolder.getKey() != null) {
            column.setId(keyHolder.getKey().intValue());
        }

        return column;
    }

    @Override
    public void delete(int id){
        final String sql = "DELETE FROM cols WHERE id = ?";

        jdbcTemplate.update(sql, id);
    }

    @Override
    public ColumnDto update(int id, ColumnDto column){
        final String sql = "UPDATE cols SET " +
                "name = ? " +
                "WHERE id = ?";

        jdbcTemplate.update(sql,
                column.getName(),
                id);

        column.setId(id);

        return column;
    }


    @Override
    public void saveAll(List<ColumnDto> columns) {
        for(ColumnDto column : columns){
            update(column.getId(), column);
        }
    }
}

