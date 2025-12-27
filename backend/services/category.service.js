import { Category } from '../model/category.model.js';

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

export const categoryService = {
    async getAllCategories() {
        return await Category.find().sort({ name: 1 });
    },

    async getCategory(identifier) {
        const query = identifier.match(/^[0-9a-fA-F]{24}$/) ? { _id: identifier } : { slug: identifier };
        const category = await Category.findOne(query);
        if (!category) throw new Error('Category not found');
        return category;
    },

    async createCategory(data) {
        const slug = data.slug || generateSlug(data.name);

        const existingCategory = await Category.findOne({
            $or: [{ name: data.name }, { slug }],
        });

        if (existingCategory) {
            if (existingCategory.name === data.name) {
                throw new Error('Category with this name already exists');
            }
            if (existingCategory.slug === slug) {
                throw new Error('Category with this slug already exists');
            }
        }

        return await Category.create({
            name: data.name,
            slug,
        });
    },

    async updateCategory(id, data) {
        const category = await Category.findById(id);
        if (!category) throw new Error('Category not found');

        if (data.name || data.slug) {
            const newSlug = data.slug || (data.name ? generateSlug(data.name) : null);

            const duplicateQuery = {
                _id: { $ne: id },
                $or: [],
            };

            if (data.name) {
                duplicateQuery.$or.push({ name: data.name });
            }
            if (newSlug) {
                duplicateQuery.$or.push({ slug: newSlug });
                data.slug = newSlug;
            }

            if (duplicateQuery.$or.length > 0) {
                const existingCategory = await Category.findOne(duplicateQuery);
                if (existingCategory) {
                    throw new Error('Category with this name or slug already exists');
                }
            }
        }

        return await Category.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    },

    async deleteCategory(id) {
        const category = await Category.findById(id);
        if (!category) throw new Error('Category not found');
        await Category.findByIdAndDelete(id);
        return true;
    }
};
