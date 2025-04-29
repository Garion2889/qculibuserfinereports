create table users (name varchar(200) not null,
                    student_id number not null,
                    branch varchar(20) not null,
                    role varchar(20) not null,
                    status varchar(20) not null);
-- Sample INSERTs for the users table
INSERT INTO users (name, student_id, branch, role, status)
VALUES ('Anna Reyes', 232017, 'San Bartolome', 'Student', 'Active');

INSERT INTO users (name, student_id, branch, role, status)
VALUES ('Brian Cruz', 174568, 'San Francisco', 'Alumni', 'Inactive');

INSERT INTO users (name, student_id, branch, role, status)
VALUES ('Carla Santos', 192842, 'Batasan', 'Student', 'Active');

INSERT INTO users (name, student_id, branch, role, status)
VALUES ('Daniel Gomez', 203658, 'San Bartolome', 'Student', 'Active');

INSERT INTO users (name, student_id, branch, role, status)
VALUES ('Ella Lim', 231021, 'San Bartolome', 'Student', 'Inactive');
commit;
                    
select * from fines;
create table faculty (name varchar(200) not null,
                    status varchar(20) not null);


insert into faculty (name,status) values('John F. Kennedy','Active');
insert into faculty (name,status) values('Dora','Active');
insert into faculty (name,status) values('Smurfette','Active');
commit;


CREATE TABLE fines (
  NAME VARCHAR2(100 BYTE),
  STUDENT_ID VARCHAR2(20 BYTE),
  BRANCH VARCHAR2(50 BYTE),
  ROLE VARCHAR2(50 BYTE),
  DUE_DATE DATE,
  PAYMENT_STATUS VARCHAR2(20 BYTE),
  FINE_AMOUNT NUMBER(10, 2)
);
commit;

-- Insert sample fines for each user
INSERT INTO fines (name, student_id, branch, role, due_date, payment_status, fine_amount)
VALUES ('Anna Reyes', '232017', 'San Bartolome', 'Student', TO_DATE('2025-04-01', 'YYYY-MM-DD'), 'Unpaid', 50.00);

INSERT INTO fines (name, student_id, branch, role, due_date, payment_status, fine_amount)
VALUES ('Brian Cruz', '174568', 'San Francisco', 'Alumni', TO_DATE('2025-03-15', 'YYYY-MM-DD'), 'Paid', 0.00);

INSERT INTO fines (name, student_id, branch, role, due_date, payment_status, fine_amount)
VALUES ('Carla Santos', '192842', 'Batasan', 'Student', TO_DATE('2025-04-10', 'YYYY-MM-DD'), 'Unpaid', 75.00);

INSERT INTO fines (name, student_id, branch, role, due_date, payment_status, fine_amount)
VALUES ('Daniel Gomez', '203658', 'San Bartolome', 'Student', TO_DATE('2025-03-28', 'YYYY-MM-DD'), 'Unpaid', 20.00);

INSERT INTO fines (name, student_id, branch, role, due_date, payment_status, fine_amount)
VALUES ('Ella Lim', '231021', 'San Bartolome', 'Student', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 'Paid', 0.00);

commit;
