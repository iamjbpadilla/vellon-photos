-- Add event_date field to galleries table
alter table galleries
add column event_date date;

-- Add comment
comment on column galleries.event_date is 'The date of the event (wedding, birthday, etc.)';
