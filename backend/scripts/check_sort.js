import mongoose from 'mongoose';
import { User } from '../model/user.model.js';
import { env } from '../utils/env.js';

const run = async () => {
    await mongoose.connect(env.MONGODB_URI);

    const results = await User.aggregate([
        { $match: { role: 'instructor' } },
        {
            $addFields: {
                priority: {
                    $switch: {
                        branches: [
                            { case: { $regexMatch: { input: "$name", regex: "Girish", options: "i" } }, then: 1 },
                            { case: { $regexMatch: { input: "$name", regex: "Parna", options: "i" } }, then: 2 },
                            { case: { $regexMatch: { input: "$name", regex: "Dinesh", options: "i" } }, then: 3 }
                        ],
                        default: 100
                    }
                }
            }
        },
        { $sort: { priority: 1 } },
        { $limit: 5 }
    ]);

    console.log(results.map(r => ({ name: r.name, priority: r.priority })));
    process.exit();
};

run();
