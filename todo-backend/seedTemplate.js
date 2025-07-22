import mongoose from 'mongoose';
import { BOARD } from './src/db'; 

mongoose.connect("mongodb+srv://anshikajainqsp:ckkrh8sdR7qBI5YB@cluster0.avhw6iw.mongodb.net/todo-full")

const templateBoards = [
    {
        name: "Personal Tasks",
        colorTheme: "purple",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "todo", name: "To Do", order: 1 },
            { id: "inprogress", name: "In Progress", order: 2 },
            { id: "onhold", name: "On Hold", order: 3 },
            { id: "completed", name: "Completed", order: 4 }
        ]
    },
    {
        name: "Work Projects",
        colorTheme: "green", 
        isTemplate: true,
        userId:null,
        columns: [
            { id: "backlog", name: "Backlog", order: 1 },
            { id: "development", name: "Development", order: 2 },
            { id: "testing", name: "Testing", order: 3 },
            { id: "deployed", name: "Deployed", order: 4 }
        ]
    },
    {
        name: "Creative Ideas",
        colorTheme: "orange",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "ideas", name: "Ideas", order: 1 },
            { id: "sketching", name: "Sketching", order: 2 },
            { id: "creating", name: "Creating", order: 3 },
            { id: "published", name: "Published", order: 4 }
        ]
    },
    {
        name: "Study Goals",
        colorTheme: "blue",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "todo", name: "To Do", order: 1 },
            { id: "inprogress", name: "In Progress", order: 2 },
            { id: "underreview", name: "Under Review", order: 3 },
            { id: "finished", name: "Finished", order: 4 }
        ]
    },
    {
        name: "Home & Family",
        colorTheme: "pink",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "shopping", name: "Shopping", order: 1 },
            { id: "cooking", name: "Cooking", order: 2 },
            { id: "cleaning", name: "Cleaning", order: 3 },
            { id: "done", name: "Done", order: 4 }
        ]
    },
    {
        name: "Health & Fitness",
        colorTheme: "teal",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "goals", name: "Goals", order: 1 },
            { id: "training", name: "Training", order: 2 },
            { id: "recovery", name: "Recovery", order: 3 },
            { id: "achieved", name: "Achieved", order: 4 }
        ]
    },
    {
        name: "Shopping Lists",
        colorTheme: "red",
        isTemplate: true,
        userId:null,
        columns: [
            { id: "need", name: "Need", order: 1 },
            { id: "researching", name: "Researching", order: 2 },
            { id: "cart", name: "Cart", order: 3 },
            { id: "purchased", name: "Purchased", order: 4 }
        ]
    }
];

async function seedTemplateBoards() {
    try {
        console.log('🌱 Starting to seed template boards...');
       
        const existingTemplates = await BOARD.find({ isTemplate: true });
        
        if (existingTemplates.length > 0) {
            console.log(`⚠️  Found ${existingTemplates.length} existing template boards.`);
            console.log('❓ Do you want to delete them and create new ones? (Delete manually if yes)');
            return;
        }
   
        const createdBoards = await BOARD.insertMany(templateBoards);
        
        console.log(`✅ Successfully created ${createdBoards.length} template boards:`);
        createdBoards.forEach(board => {
            console.log(`   - ${board.name} (${board.colorTheme})`);
        });
        
        console.log(' Template boards seeding completed!');
        
    } catch (error) {
        console.error('Error seeding template boards:', error);
    } finally {
        mongoose.connection.close();
        console.log('📡 Database connection closed.');
    }
}

seedTemplateBoards();