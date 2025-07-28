-- Add sample users with Indian names
-- 1 DCP, 2 ACPs, 6 PIs

-- 1 DCP
INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (1, 'DCP Rajesh Kumar', 'dcp.rajesh@police.gov.in', 'password123', 'DCP', NULL);

-- 2 ACPs
INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (2, 'ACP Priya Sharma', 'acp.priya@police.gov.in', 'password123', 'ACP', NULL);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (3, 'ACP Amit Patel', 'acp.amit@police.gov.in', 'password123', 'ACP', NULL);

-- 6 PIs
INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (4, 'PI Anjali Singh', 'pi.anjali@police.gov.in', 'password123', 'PI', 1);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (5, 'PI Ravi Verma', 'pi.ravi@police.gov.in', 'password123', 'PI', 2);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (6, 'PI Meera Reddy', 'pi.meera@police.gov.in', 'password123', 'PI', 3);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (7, 'PI Sanjay Gupta', 'pi.sanjay@police.gov.in', 'password123', 'PI', 4);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (8, 'PI Kavita Joshi', 'pi.kavita@police.gov.in', 'password123', 'PI', 5);

INSERT INTO Users (user_id, name, email, password, role, station_id) 
VALUES (9, 'PI Arjun Malhotra', 'pi.arjun@police.gov.in', 'password123', 'PI', 6);

-- Update the auto-increment counter
ALTER TABLE Users AUTO_INCREMENT = 10; 