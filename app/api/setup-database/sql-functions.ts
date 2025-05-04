import { createServerClient } from "@/lib/supabase"

export async function createSQLFunctions() {
  const supabase = createServerClient()

  try {
    // Create a function to create the uuid-ossp extension
    const { error: functionError } = await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE OR REPLACE FUNCTION create_uuid_extension()
        RETURNS void AS $$
        BEGIN
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
      })
      .single()

    if (functionError) {
      // If the function doesn't exist yet, we need to create it using a different approach
      if (functionError.message.includes("function exec_sql") || functionError.message.includes("does not exist")) {
        // Create the exec_sql function first
        const { error: createFunctionError } = await supabase.from("_setup_functions").insert({
          sql: `
            CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
            RETURNS void AS $$
            BEGIN
              EXECUTE sql_string;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            CREATE OR REPLACE FUNCTION create_uuid_extension()
            RETURNS void AS $$
            BEGIN
              CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            CREATE TABLE IF NOT EXISTS _schema_setup (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              table_name TEXT NOT NULL,
              sql TEXT NOT NULL,
              executed BOOLEAN DEFAULT FALSE
            );
            
            CREATE TABLE IF NOT EXISTS _setup_functions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              sql TEXT NOT NULL
            );
          `,
        })

        if (createFunctionError) {
          console.error("Error creating SQL functions:", createFunctionError)
          return { success: false, error: createFunctionError }
        }
      } else {
        console.error("Error creating SQL functions:", functionError)
        return { success: false, error: functionError }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating SQL functions:", error)
    return { success: false, error }
  }
}
