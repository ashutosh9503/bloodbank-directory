<?php
// models/Institute.php

class Institute {
    private PDO $pdo;
    private string $table = "institutes"; // name of your table

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // Fetch all records
    public function readAll(): PDOStatement {
        $sql = "SELECT * FROM {$this->table} ORDER BY id ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt;
    }
}
