const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmzwdjtgsjcpycrhwsbe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error("Please set SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkLatestLetter() {
    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching letter:", error);
        return;
    }

    console.log("--- Latest Letter Debug Info ---");
    console.log("ID:", data.id);
    console.log("Subject:", data.subject);
    console.log("Sender:", data.sender);
    console.log("Summary (Error Message?):", data.summary);
    console.log("Extracted Data JSON:", JSON.stringify(data.extracted_data, null, 2));
}

checkLatestLetter();
