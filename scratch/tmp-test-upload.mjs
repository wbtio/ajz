import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Service Role Key exists:", !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing env variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  try {
    console.log("Checking buckets...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error("Bucket list error:", bucketError);
      return;
    }
    console.log("Existing Buckets:", buckets.map(b => b.name));

    // Try to check if events-bucket exists or create it
    const hasEventsBucket = buckets.some(b => b.name === "events-bucket");
    if (!hasEventsBucket) {
      console.log("Creating events-bucket...");
      const { data, error } = await supabase.storage.createBucket("events-bucket", { public: true });
      if (error) {
        console.error("Failed to create events-bucket:", error);
      } else {
        console.log("Created events-bucket successfully");
      }
    }

    console.log("Uploading test file...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("events-bucket")
      .upload("test-file.txt", Buffer.from("Hello from Antigravity debug script!"), {
        contentType: "text/plain",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    } else {
      console.log("Upload success:", uploadData);
      const { data: urlData } = supabase.storage.from("events-bucket").getPublicUrl("test-file.txt");
      console.log("Public URL:", urlData.publicUrl);
    }
  } catch (err) {
    console.error("Caught error:", err);
  }
}

run();
