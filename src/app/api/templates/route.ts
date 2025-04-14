// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import clientPromise from '@/util/mongodb'; // Adjust path if needed

// Define the Template structure for the database
interface TemplateDocument {
    _id?: ObjectId;
    name: string;
    columns: string[];
    taskSplitPrompt: string;
    systemPrompt: string;
    createdAt: Date;
    updatedAt: Date;
}

let client: MongoClient;
let db: Db;
let templates: Collection<TemplateDocument>;

// Function to initialize DB connection (cached)
async function initDb() {
    if (db && client) {
         // console.log("Database connection already initialized and connected."); // Optional: more verbose check
         return; // Return if already initialized and connected
    }
    try {
        // console.log("Initializing database connection..."); // Debug log
        client = await clientPromise;
        db = client.db(); // Use default DB from connection string or specify one: client.db("yourDbName")
        templates = db.collection<TemplateDocument>('templates');
        // console.log("Database connection initialized successfully.");
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        // Reset state if connection failed
        // @ts-ignore
        db = undefined;
        // @ts-ignore
        templates = undefined;
        throw new Error('Failed to connect to the database.');
    }
}

// Ensure DB connection before handling requests
// ***** FIX: Remove async from the wrapper function itself *****
function ensureDbConnection(handler: (req: NextRequest, params?: { params: { id?: string } }) => Promise<Response>) {
    // This inner function SHOULD be async because it awaits initDb and the handler
    return async (req: NextRequest, params?: { params: { id?: string } }): Promise<Response> => {
        try {
            await initDb(); // Ensure DB is ready before calling the handler
            if (!db || !templates) { // Double-check if initDb failed silently or was reset
                 throw new Error('Database connection is not available.');
            }
            return await handler(req, params); // Execute the actual route handler
        } catch (error: any) {
            console.error("API Route Error:", error);
            // Improved error reporting
            const message = error.message || 'An internal server error occurred.';
            const status = typeof error.status === 'number' ? error.status : 500;
            // Log the stack trace for server-side debugging
            if (error.stack) {
                console.error(error.stack);
            }
            return NextResponse.json({ error: message }, { status });
        }
    };
}

// --- API Handlers ---

// GET /api/templates - Fetch all templates
// GET /api/templates?id={templateId} - Fetch a single template
const handleGet = ensureDbConnection(async (req) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid template ID format' }, { status: 400 });
        }
        const template = await templates.findOne({ _id: new ObjectId(id) });
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
        return NextResponse.json(template);
    } else {
        const allTemplates = await templates.find({}, { projection: { name: 1, _id: 1 } }).sort({ name: 1 }).toArray();
        return NextResponse.json(allTemplates);
    }
});

// POST /api/templates - Create a new template
const handlePost = ensureDbConnection(async (req) => {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { name, columns, taskSplitPrompt, systemPrompt } = body;

    // Stricter validation
    if (!name || typeof name !== 'string' || name.trim() === '' ||
        !Array.isArray(columns) ||
        typeof taskSplitPrompt !== 'string' ||
        typeof systemPrompt !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid required fields (name, columns, taskSplitPrompt, systemPrompt)' }, { status: 400 });
    }

    if (columns.length === 0 || columns.some(col => typeof col !== 'string' || col.trim() === '')) {
         return NextResponse.json({ error: 'Columns array cannot be empty and must contain non-empty strings' }, { status: 400 });
    }

    const newTemplate: Omit<TemplateDocument, '_id'> = {
        name: name.trim(),
        columns,
        taskSplitPrompt,
        systemPrompt,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        const result = await templates.insertOne(newTemplate);
        // Fetch the created document to return it with the generated _id
        const createdTemplate = await templates.findOne({ _id: result.insertedId });
        return NextResponse.json(createdTemplate, { status: 201 });
    } catch (error: any) {
         console.error("Error inserting template:", error);
         // Handle potential duplicate key errors (if you add unique indexes)
         if (error.code === 11000) { // MongoDB duplicate key error code
             return NextResponse.json({ error: 'A template with this name might already exist.' }, { status: 409 }); // Conflict
         }
         return NextResponse.json({ error: 'Failed to create template.' }, { status: 500 });
    }
});

// PUT /api/templates?id={templateId} - Update an existing template
const handlePut = ensureDbConnection(async (req) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid or missing template ID' }, { status: 400 });
    }

    let body;
     try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { name, columns, taskSplitPrompt, systemPrompt } = body;

    // Stricter validation for update
    if (!name || typeof name !== 'string' || name.trim() === '' ||
        !Array.isArray(columns) ||
        typeof taskSplitPrompt !== 'string' ||
        typeof systemPrompt !== 'string') {
        return NextResponse.json({ error: 'Missing or invalid required fields for update (name, columns, taskSplitPrompt, systemPrompt)' }, { status: 400 });
    }
     if (columns.length === 0 || columns.some(col => typeof col !== 'string' || col.trim() === '')) {
         return NextResponse.json({ error: 'Columns array cannot be empty and must contain non-empty strings' }, { status: 400 });
    }

    const updateData: Partial<Omit<TemplateDocument, '_id' | 'createdAt'>> = { // Exclude fields that shouldn't be set directly on update
        name: name.trim(),
        columns,
        taskSplitPrompt,
        systemPrompt,
        updatedAt: new Date(),
    };

    // No need to manually remove undefined keys if using Partial and spreading potentially undefined values,
    // but the current approach using $set with a well-defined object is clearer.

    try {
        const result = await templates.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }
         // It's okay if modifiedCount is 0 (data was the same), still return success with the current data.
         // Fetch the updated (or current) document to return it
        const updatedTemplate = await templates.findOne({ _id: new ObjectId(id) });
         if (!updatedTemplate) {
            // This shouldn't happen if matchedCount was > 0, but safety check
            return NextResponse.json({ error: 'Template found but failed to retrieve after update.' }, { status: 500 });
         }
        return NextResponse.json(updatedTemplate);

    } catch (error: any) {
        console.error(`Error updating template ${id}:`, error);
         // Handle potential duplicate key errors (if you add unique indexes and update changes a unique field)
         if (error.code === 11000) {
             return NextResponse.json({ error: 'Update failed, potentially due to duplicate name.' }, { status: 409 }); // Conflict
         }
        return NextResponse.json({ error: 'Failed to update template.' }, { status: 500 });
    }
});

// DELETE /api/templates?id={templateId} - Delete a template
const handleDelete = ensureDbConnection(async (req) => {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid or missing template ID' }, { status: 400 });
    }

    try {
        const result = await templates.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Use 204 No Content for successful deletion with no body, or 200 with a message
        // return new NextResponse(null, { status: 204 });
         return NextResponse.json({ message: 'Template deleted successfully' }, { status: 200 });

    } catch (error: any) {
         console.error(`Error deleting template ${id}:`, error);
         return NextResponse.json({ error: 'Failed to delete template.' }, { status: 500 });
    }
});

// Export handlers for Next.js App Router
export { handleGet as GET, handlePost as POST, handlePut as PUT, handleDelete as DELETE };