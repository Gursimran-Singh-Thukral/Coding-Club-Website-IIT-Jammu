/**

    @fileoverview Renames the 'Manager' role to 'Coordinator' to match the
    PRD's actual terminology (the app never called it "Manager" in the UI
    text or docs - only the enum value did).

    This handles two different realities, because the live database on this
    project turned out not to match schema.sql's ENUM-based design (`role`
    was never actually created as the `public.student_role` enum type - it's
    a plain column instead, confirmed by `'public.student_role'::regtype`
    raising 42704 "type does not exist" on the first attempt at this
    migration):

      - If `student_role` genuinely is an enum type with a 'Manager' value,
        RENAME VALUE relabels it - every existing row with role = 'Manager'
        reads as 'Coordinator' immediately, no data migration needed.
      - Otherwise (a plain TEXT/VARCHAR column, as on the actual live DB),
        falls back to updating the data directly, first dropping any CHECK
        constraint on the column that might reject the new value.

    Safe to re-run either way.

*/

DO $$
DECLARE
    r RECORD;
BEGIN

    BEGIN

        ALTER TYPE public.student_role RENAME VALUE 'Manager' TO 'Coordinator';

    EXCEPTION

        WHEN undefined_object THEN

            -- Not an enum (or no 'Manager' value on it) - drop any CHECK
            -- constraint guarding public.users.role, then update the data.

            FOR r IN

                SELECT con.conname
                FROM pg_constraint con
                JOIN pg_class rel ON rel.oid = con.conrelid
                JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
                WHERE rel.relname = 'users' AND att.attname = 'role' AND con.contype = 'c'

            LOOP

                EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', r.conname);

            END LOOP;

            UPDATE public.users SET role = 'Coordinator' WHERE role = 'Manager';

    END;

END $$;
