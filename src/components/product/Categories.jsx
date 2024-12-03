import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setFilterCategory } from '../../model/reducer/productFilterReducer';
import { Tree } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const CategoryComponent = ({ data, selectedCategories,
    setSelectedCategories, setproductresult, setoffset }) => {
    const dispatch = useDispatch();
    const [treeData, setTreeData] = useState([])
    const [expandedKeys, setExpandedKeys] = useState([])

    useEffect(() => {
        if (data?.length > 0) {
            const cat = transformCategoryData(data);
            setTreeData(cat);
        }
    }, [data]);


    const transformCategoryData = (categories) => {
        return categories?.map(category => ({
            title: category.name,
            key: category.id,
            children: category.cat_active_childs.length > 0
                ? transformCategoryData(category.cat_active_childs)
                : []
        }));
    };

    const onExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
    };

    const handleExpandCollapse = (node) => {
        const newExpandedKeys = expandedKeys.includes(node.key)
            ? expandedKeys.filter(key => key !== node.key)
            : [...expandedKeys, node.key];
        setExpandedKeys(newExpandedKeys);
    };

    const renderTitle = (node) => {
        const isExpanded = expandedKeys.includes(node.key);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div className='d-flex category-node align-items-center'>
                <div>{node.title}{' '}</div>
                {hasChildren && (
                    isExpanded
                        ? <MinusOutlined className='ml-5' onClick={() => handleExpandCollapse(node)} />
                        : <PlusOutlined className='ml-5' onClick={() => handleExpandCollapse(node)} />
                )}
            </div>
        );
    };

    const renderTreeNodes = (data) =>
        data?.map((item) => ({
            ...item,
            title: renderTitle(item), // Pass custom title for each node
            children: item.children.length > 0 ? renderTreeNodes(item.children) : [],
        }));

    const onCheck = (catIds) => {
        setproductresult([])
        setoffset(0)
        setSelectedCategories(catIds)
        dispatch(setFilterCategory({ data: catIds.join(",") }));
    }
    return (
        <>
            <Tree
                checkable
                treeData={renderTreeNodes(treeData)}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                defaultExpandAll={false}
                onCheck={onCheck}
                checkedKeys={selectedCategories}
                showLine={false}
                switcherIcon={null}

            />
        </>
    );
};

export default CategoryComponent;
