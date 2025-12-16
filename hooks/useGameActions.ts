
import React from 'react';
import { Player, Item, EquipmentSlot, SkillType, Spell, PlayerSettings, Vocation, GmFlags, HuntingTask, AscensionPerk, LogEntry, OfflineReport } from '../types';
import { calculateSoulPointsToGain, generatePreyCard, generateTaskOptions, generateSingleTask, reforgeItemStats, getReforgeCost, getAscensionUpgradeCost, resetCombatState } from '../services';
import { SHOP_ITEMS, BOSSES, QUESTS, INITIAL_PLAYER_STATS, getXpForLevel, MAX_BACKPACK_SLOTS, MAX_DEPOT_SLOTS } from '../constants';

export const useGameActions = (
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    setGameSpeed: (speed: number) => void,
    setAnalyzerHistory: React.Dispatch<React.SetStateAction<any[]>>,
    setIsPaused: (paused: boolean) => void,
    setActiveTutorial: (tut: any) => void,
    setReforgeResult: (res: any) => void,
    addLog: (msg: string, type: LogEntry['type'], rarity?: any) => void,
    monsterHpRef: React.MutableRefObject<number>,
    setCurrentMonsterHp: (hp: number) => void,
    setActiveMonster: (m: any) => void,
    setSessionKills: React.Dispatch<React.SetStateAction<{[name:string]: number}>>,
    setOfflineReport: React.Dispatch<React.SetStateAction<OfflineReport | null>>
) => {

    const updatePlayerState = (fn: (p: Player) => Player | null) => {
        setPlayer(prev => {
            if (!prev) return null;
            const newVal = fn(prev);
            return newVal ? newVal : prev;
        });
    };

    const getSlotCount = (p: Player) => {
        return Object.keys(p.inventory).length + (p.uniqueInventory?.length || 0);
    };

    const getDepotCount = (p: Player) => {
        return Object.keys(p.depot).length + (p.uniqueDepot?.length || 0);
    };

    return {
        setGameSpeed: (speed: number) => setGameSpeed(speed),
        resetAnalyzer: () => {
            setAnalyzerHistory([]);
            setSessionKills({});
        },
        closeTutorial: () => {
            setIsPaused(false);
            setActiveTutorial(null);
        },
        closeOfflineModal: () => {
            setOfflineReport(null);
            setIsPaused(false); // Unpause game loop
        },
        setActiveHazardLevel: (level: number) => {
            updatePlayerState(p => ({
                ...p,
                activeHazardLevel: Math.max(0, Math.min(level, p.hazardLevel))
            }));
        },
        removeGold: (amount: number) => {
            updatePlayerState(p => {
                if (p.gold + p.bankGold < amount) {
                    addLog(`Insufficient gold (Need ${amount}).`, 'danger');
                    return p;
                }
                
                let remainingCost = amount;
                let newGold = p.gold;
                let newBank = p.bankGold;

                // Deduct from Inventory first
                if (newGold >= remainingCost) {
                    newGold -= remainingCost;
                    remainingCost = 0;
                } else {
                    remainingCost -= newGold;
                    newGold = 0;
                }

                // Deduct remaining from Bank
                if (remainingCost > 0) {
                    newBank -= remainingCost;
                }

                return { ...p, gold: newGold, bankGold: newBank };
            });
            addLog(`Paid ${amount.toLocaleString()} gold.`, 'info');
        },
        startHunt: (monsterId: string, _name: string, isBoss: boolean, count: number = 1) => {
            updatePlayerState(p => {
                const newCooldowns = { ...p.bossCooldowns };
                
                // Apply Cooldown IMMEDIATELY on start for Bosses
                if (isBoss) {
                    const boss = BOSSES.find(b => b.id === monsterId);
                    if (boss && boss.cooldownSeconds) {
                        newCooldowns[monsterId] = Date.now() + (boss.cooldownSeconds * 1000);
                    }
                }

                return {
                    ...p,
                    activeHuntId: monsterId,
                    activeHuntCount: count,
                    activeHuntStartTime: Date.now(),
                    activeTrainingSkill: null,
                    activeTrainingStartTime: 0,
                    bossCooldowns: newCooldowns
                };
            });
            
            // RESET ENGINE STATE to fix first spawn bug and ensure new timers
            resetCombatState(); 
            monsterHpRef.current = 0; // Trigger spawn logic in next tick
            setCurrentMonsterHp(0);
            setActiveMonster(undefined);
            addLog(`Started hunting ${monsterId}.`, 'info');
        },
        stopHunt: () => {
            updatePlayerState(p => ({ ...p, activeHuntId: null, activeHuntStartTime: 0 }));
            resetCombatState();
            monsterHpRef.current = 0;
            setActiveMonster(undefined);
            addLog("Stopped hunting.", 'info');
        },
        startTraining: (skill: SkillType) => {
            updatePlayerState(p => ({
                ...p,
                activeTrainingSkill: skill,
                activeTrainingStartTime: Date.now(),
                activeHuntId: null,
                activeHuntStartTime: 0
            }));
            resetCombatState();
            addLog(`Started training ${skill}.`, 'info');
        },
        stopTraining: () => {
            updatePlayerState(p => ({ ...p, activeTrainingSkill: null, activeTrainingStartTime: 0 }));
            addLog("Stopped training.", 'info');
        },
        buyItem: (item: Item, quantity: number = 1) => {
            updatePlayerState(prev => {
                // Check Capacity for New Items
                const isStacking = prev.inventory[item.id] !== undefined;
                if (!isStacking) {
                    if (getSlotCount(prev) >= MAX_BACKPACK_SLOTS) {
                        addLog("Backpack full!", 'danger');
                        return prev;
                    }
                }

                if (prev.gold < item.price * quantity) return prev;
                const newInv = { ...prev.inventory };
                newInv[item.id] = (newInv[item.id] || 0) + quantity;
                return { ...prev, gold: prev.gold - (item.price * quantity), inventory: newInv };
            });
            addLog(`Bought ${quantity}x ${item.name}.`, 'gain');
        },
        sellItem: (item: Item, quantity: number = 1) => {
            if (item.uniqueId) {
                updatePlayerState(prev => {
                    const uniqueInv = prev.uniqueInventory || [];
                    const exists = uniqueInv.find(i => i.uniqueId === item.uniqueId);
                    if (!exists) return prev;
                    return { 
                        ...prev, 
                        gold: prev.gold + item.sellPrice, 
                        uniqueInventory: uniqueInv.filter(i => i.uniqueId !== item.uniqueId) 
                    };
                });
                addLog(`Sold ${item.name} (${item.rarity || 'unique'}).`, 'info');
            } else {
                updatePlayerState(prev => {
                    if ((prev.inventory[item.id] || 0) < quantity) return prev;
                    const newInv = { ...prev.inventory };
                    newInv[item.id] -= quantity;
                    if (newInv[item.id] <= 0) delete newInv[item.id]; // Remove empty key
                    return { ...prev, gold: prev.gold + (item.sellPrice * quantity), inventory: newInv };
                });
                addLog(`Sold ${quantity}x ${item.name}.`, 'info');
            }
        },
        sellManyItems: (itemsToSell: { itemId: string, quantity: number, unitPrice: number }[]) => {
            updatePlayerState(prev => {
                let totalGain = 0;
                const newInv = { ...prev.inventory };
                
                itemsToSell.forEach(({ itemId, quantity, unitPrice }) => {
                    if (newInv[itemId] && newInv[itemId] >= quantity) {
                        newInv[itemId] -= quantity;
                        if (newInv[itemId] <= 0) delete newInv[itemId];
                        totalGain += quantity * unitPrice;
                    }
                });

                if (totalGain === 0) return prev; // Nothing sold

                return { ...prev, gold: prev.gold + totalGain, inventory: newInv };
            });
            const totalCount = itemsToSell.reduce((acc, i) => acc + i.quantity, 0);
            addLog(`Bulk sold ${totalCount} items.`, 'gain');
        },
        equipItem: (item: Item) => {
            updatePlayerState(prev => {
                if (!item.slot) return prev;

                if (item.requiredVocation && prev.vocation !== Vocation.NONE && !item.requiredVocation.includes(prev.vocation)) {
                    addLog(`Only ${item.requiredVocation.join(' or ')} can equip this.`, 'danger');
                    return prev;
                }

                // If unequipping something into a full backpack, we might have an issue
                // Logic: 
                // 1. Remove Item from Inventory/UniqueInventory
                // 2. Add CurrentEquipped to Inventory/UniqueInventory
                // 3. Set Item as Equipped
                
                // If Item being equipped is from a stack, it might leave an empty slot or stay as stack.
                // If Item being unequipped is new to inventory, it needs a slot.
                
                let slotsUsed = getSlotCount(prev);
                
                // Simulate removal
                let simulatedSlots = slotsUsed;
                if (item.uniqueId) simulatedSlots--; 
                else if ((prev.inventory[item.id] || 0) === 1) simulatedSlots--; // If it was stack of 1, slot frees up

                // Simulate addition of currently equipped item
                const currentEquipped = prev.equipment[item.slot];
                if (currentEquipped) {
                    if (currentEquipped.uniqueId) simulatedSlots++;
                    else if (!prev.inventory[currentEquipped.id]) simulatedSlots++; // New stack
                }

                if (simulatedSlots > MAX_BACKPACK_SLOTS) {
                    addLog("Not enough room to swap items.", 'danger');
                    return prev;
                }

                let newInv = { ...prev.inventory };
                let newUniqueInv = [...(prev.uniqueInventory || [])];
                
                if (item.uniqueId) {
                    newUniqueInv = newUniqueInv.filter(i => i.uniqueId !== item.uniqueId);
                } else {
                    if ((newInv[item.id] || 0) <= 0) return prev;
                    newInv[item.id]--;
                    if (newInv[item.id] <= 0) delete newInv[item.id];
                }

                if (currentEquipped) {
                    if (currentEquipped.uniqueId) newUniqueInv.push(currentEquipped);
                    else newInv[currentEquipped.id] = (newInv[currentEquipped.id] || 0) + 1;
                }

                const newEquip = { ...prev.equipment, [item.slot]: item };
                return { ...prev, inventory: newInv, uniqueInventory: newUniqueInv, equipment: newEquip };
            });
        },
        unequipItem: (slot: EquipmentSlot) => {
            updatePlayerState(prev => {
                const item = prev.equipment[slot];
                if (!item) return prev;
                
                // Check Capacity
                const isStacking = !item.uniqueId && prev.inventory[item.id] !== undefined;
                if (!isStacking) {
                    if (getSlotCount(prev) >= MAX_BACKPACK_SLOTS) {
                        addLog("Backpack full!", 'danger');
                        return prev;
                    }
                }

                const newEquip = { ...prev.equipment };
                delete newEquip[slot];

                let newInv = { ...prev.inventory };
                let newUniqueInv = [...(prev.uniqueInventory || [])];

                if (item.uniqueId) newUniqueInv.push(item);
                else newInv[item.id] = (newInv[item.id] || 0) + 1;

                return { ...prev, equipment: newEquip, inventory: newInv, uniqueInventory: newUniqueInv };
            });
        },
        depositItem: (item: Item) => {
            updatePlayerState(prev => {
                // CHECK DEPOT LIMIT
                // Unique Item adds 1 slot. Standard item adds 1 slot if not exists.
                const isStackingDepot = !item.uniqueId && prev.depot[item.id] !== undefined;
                if (!isStackingDepot) {
                    if (getDepotCount(prev) >= MAX_DEPOT_SLOTS) {
                        addLog("Depot Chest is full!", 'danger');
                        return prev;
                    }
                }

                if (item.uniqueId) {
                    // UNIQUE ITEM DEPOSIT
                    const uniqueInv = prev.uniqueInventory || [];
                    const exists = uniqueInv.find(i => i.uniqueId === item.uniqueId);
                    
                    if (!exists) return prev;
                    
                    // Remove from inventory
                    const newUniqueInv = uniqueInv.filter(i => i.uniqueId !== item.uniqueId);
                    
                    // Add to depot
                    const currentDepot = (prev.uniqueDepot && Array.isArray(prev.uniqueDepot)) ? prev.uniqueDepot : [];
                    const newUniqueDepot = [...currentDepot, item];
                    
                    addLog(`Deposited ${item.name} (${item.rarity}) to depot.`, 'info');
                    
                    return { 
                        ...prev, 
                        uniqueInventory: newUniqueInv, 
                        uniqueDepot: newUniqueDepot 
                    };
                } else {
                    // STANDARD ITEM DEPOSIT
                    const amount = prev.inventory[item.id] || 0;
                    if (amount <= 0) return prev;
                    
                    const newInv = { ...prev.inventory };
                    delete newInv[item.id]; 
                    
                    const newDepot = { ...prev.depot };
                    newDepot[item.id] = (newDepot[item.id] || 0) + amount;
                    
                    addLog(`Deposited all ${item.name} to depot.`, 'info');
                    return { ...prev, inventory: newInv, depot: newDepot };
                }
            });
        },
        withdrawItem: (item: Item) => {
            updatePlayerState(prev => {
                // CHECK BACKPACK LIMIT
                const isStackingBP = !item.uniqueId && prev.inventory[item.id] !== undefined;
                if (!isStackingBP) {
                    if (getSlotCount(prev) >= MAX_BACKPACK_SLOTS) {
                        addLog("Backpack full!", 'danger');
                        return prev;
                    }
                }

                if (item.uniqueId) {
                    // UNIQUE ITEM WITHDRAW
                    const currentDepot = (prev.uniqueDepot && Array.isArray(prev.uniqueDepot)) ? prev.uniqueDepot : [];
                    const exists = currentDepot.find(i => i.uniqueId === item.uniqueId);
                    
                    if (!exists) return prev;

                    const newUniqueDepot = currentDepot.filter(i => i.uniqueId !== item.uniqueId);
                    
                    const currentInv = prev.uniqueInventory || [];
                    const newUniqueInv = [...currentInv, item];
                    
                    return { 
                        ...prev, 
                        uniqueDepot: newUniqueDepot, 
                        uniqueInventory: newUniqueInv 
                    };
                } else {
                    // STANDARD ITEM WITHDRAW
                    if ((prev.depot[item.id] || 0) <= 0) return prev;
                    
                    const newDepot = { ...prev.depot };
                    newDepot[item.id]--;
                    if (newDepot[item.id] <= 0) delete newDepot[item.id];

                    const newInv = { ...prev.inventory };
                    newInv[item.id] = (newInv[item.id] || 0) + 1;
                    
                    return { ...prev, depot: newDepot, inventory: newInv };
                }
            });
        },
        discardItem: (item: Item) => {
            updatePlayerState(prev => {
                if (item.uniqueId) {
                    const newUniqueInv = (prev.uniqueInventory || []).filter(i => i.uniqueId !== item.uniqueId);
                    addLog(`Dropped ${item.name}.`, 'info');
                    return { ...prev, uniqueInventory: newUniqueInv };
                }
                const amount = prev.inventory[item.id] || 0;
                if (amount > 0) {
                    const newInv = { ...prev.inventory };
                    delete newInv[item.id];
                    addLog(`Dropped all ${item.name} (${amount}).`, 'info');
                    return { ...prev, inventory: newInv };
                }
                return prev;
            });
        },
        reforgeItem: (item: Item) => {
            updatePlayerState(prev => {
                if (!item.uniqueId) return prev; 
                const TOKEN_ID = 'forge_token';
                const cost = getReforgeCost(item.rarity);
                
                const tokenCount = prev.inventory[TOKEN_ID] || 0;
                if (tokenCount < cost) {
                    addLog(`Not enough Forge Tokens (Need ${cost}).`, 'danger');
                    return prev;
                }
                
                const newInv = { ...prev.inventory };
                newInv[TOKEN_ID] -= cost;
                // If tokens hit 0, slot is removed. Reforged item takes same slot (it's updated in place or swapped), so slot count is stable or decreases (if tokens vanish).
                if (newInv[TOKEN_ID] <= 0) delete newInv[TOKEN_ID];
                
                const oldItem = { ...item };
                const newItem = reforgeItemStats({ ...item });
                
                const newUniqueInv = prev.uniqueInventory.map(i => i.uniqueId === item.uniqueId ? newItem : i);
                const newEquipment = { ...prev.equipment };
                if (item.slot && newEquipment[item.slot]?.uniqueId === item.uniqueId) {
                    newEquipment[item.slot] = newItem;
                }

                // Only generic log message now, details in the Modal
                addLog(`Reforged ${item.name}. Stats updated!`, 'magic');
                
                setReforgeResult({ oldItem, newItem });
                return { ...prev, inventory: newInv, uniqueInventory: newUniqueInv, equipment: newEquipment };
            });
        },
        closeReforgeModal: () => {
            setReforgeResult(null);
        },
        toggleSkippedLoot: (itemId: string) => {
            updatePlayerState(prev => {
                const isSkipped = prev.skippedLoot.includes(itemId);
                const newSkipped = isSkipped ? prev.skippedLoot.filter(id => id !== itemId) : [...prev.skippedLoot, itemId];
                return { ...prev, skippedLoot: newSkipped };
            });
        },
        handleToggleSkippedLoot: (itemId: string) => {
            // Self-referencing wrapper if needed, or direct call
            // Using updatePlayerState for consistency
            updatePlayerState(prev => {
                const isSkipped = prev.skippedLoot.includes(itemId);
                const newSkipped = isSkipped ? prev.skippedLoot.filter(id => id !== itemId) : [...prev.skippedLoot, itemId];
                return { ...prev, skippedLoot: newSkipped };
            });
        },
        handleBuyBlessing: () => {
            updatePlayerState(prev => {
                const cost = prev.level <= 30 ? 2000 : prev.level >= 120 ? 20000 : 2000 + (prev.level - 30) * 200;
                if (prev.hasBlessing || prev.gold < cost) return prev;
                return { ...prev, gold: prev.gold - cost, hasBlessing: true };
            });
            addLog("Received the blessing of Henricus.", 'gain');
        },
        promotePlayer: () => {
            updatePlayerState(prev => {
                if (prev.gold < 20000 || prev.promoted) return prev;
                return { ...prev, gold: prev.gold - 20000, promoted: true };
            });
            addLog("You have been promoted by King Tibianus!", 'gain');
        },
        buySpell: (spell: Spell) => {
            updatePlayerState(prev => {
                if (prev.gold < spell.price || prev.purchasedSpells.includes(spell.id)) return prev;
                return { ...prev, gold: prev.gold - spell.price, purchasedSpells: [...prev.purchasedSpells, spell.id] };
            });
            addLog(`Learned spell: ${spell.name}.`, 'magic');
        },
        updateSettings: (settings: PlayerSettings) => {
            updatePlayerState(prev => ({ ...prev, settings }));
        },
        buyCoins: (amount: number) => {
            updatePlayerState(prev => ({ ...prev, tibiaCoins: prev.tibiaCoins + amount }));
            addLog(`Purchased ${amount} Tibia Coins.`, 'gain');
        },
        buyPremium: () => {
            updatePlayerState(prev => {
                if (prev.tibiaCoins < 50) return prev;
                const now = Date.now();
                const newTime = (prev.premiumUntil > now ? prev.premiumUntil : now) + (7 * 24 * 3600 * 1000);
                return { ...prev, tibiaCoins: prev.tibiaCoins - 50, premiumUntil: newTime };
            });
            addLog("Extended Premium Time by 7 days.", 'gain');
        },
        buyBoost: () => {
            updatePlayerState(prev => {
                if (prev.tibiaCoins < 10) return prev;
                const now = Date.now();
                const newTime = (prev.xpBoostUntil > now ? prev.xpBoostUntil : now) + (3600 * 1000);
                return { ...prev, tibiaCoins: prev.tibiaCoins - 10, xpBoostUntil: newTime };
            });
            addLog("Activated XP Boost for 1 hour.", 'gain');
        },
        depositGold: (amount: number) => {
            updatePlayerState(prev => {
                if (prev.gold < amount) return prev;
                return { ...prev, gold: prev.gold - amount, bankGold: prev.bankGold + amount };
            });
            addLog(`Deposited ${amount} gold.`, 'info');
        },
        withdrawGold: (amount: number) => {
            updatePlayerState(prev => {
                if (prev.bankGold < amount) return prev;
                return { ...prev, bankGold: prev.bankGold - amount, gold: prev.gold + amount };
            });
            addLog(`Withdrew ${amount} gold.`, 'info');
        },
        selectTask: (task: HuntingTask) => {
            updatePlayerState(prev => {
                const newOptions = prev.taskOptions.map(t => {
                    if (t.uuid === task.uuid) {
                        return { ...t, status: 'active' as const };
                    }
                    return t;
                });
                return { ...prev, taskOptions: newOptions };
            });
            addLog(`Accepted task: ${task.type === 'collect' ? 'Collect' : 'Kill'} ${task.amountRequired}x ${task.targetName}.`, 'info');
        },
        cancelTask: (taskUuid: string) => {
            updatePlayerState(prev => {
                // Reset progress and set back to available (or could regen, but simple reset is better for UX to avoid free rerolls via cancel)
                const newOptions = prev.taskOptions.map(t => {
                    if (t.uuid === taskUuid) {
                        return { ...t, status: 'available' as const, amountCurrent: 0, killsCurrent: 0 };
                    }
                    return t;
                });
                return { ...prev, taskOptions: newOptions };
            });
            addLog("Cancelled task.", 'info');
        },
        rerollTasks: () => {
            // GLOBAL REROLL
            updatePlayerState(prev => {
                const now = Date.now();
                const isFree = now > (prev.taskNextFreeReroll || 0);
                
                // NEW GLOBAL REROLL COST (8x Individual)
                const cost = prev.level * 800;
                
                if (!isFree && prev.gold < cost) return prev;
                
                const newGold = isFree ? prev.gold : prev.gold - cost;
                const nextFree = isFree ? now + (20 * 60 * 60 * 1000) : prev.taskNextFreeReroll;

                // PRESERVE ACTIVE TASKS
                const newTaskOptions = prev.taskOptions.map((task, index) => {
                    if (task.status === 'active') {
                        return task;
                    }
                    // Generate new task for this slot
                    const type = index < 4 ? 'kill' : 'collect';
                    return generateSingleTask(prev.level, type);
                });

                return { 
                    ...prev, 
                    gold: newGold, 
                    taskOptions: newTaskOptions,
                    taskNextFreeReroll: nextFree
                };
            });
        },
        rerollSpecificTask: (index: number) => {
            updatePlayerState(prev => {
                // INCREASED COST (Double)
                const cost = prev.level * 100;
                
                if (prev.gold < cost) {
                    addLog("Not enough gold to reroll this contract.", 'danger');
                    return prev;
                }
                
                const newOptions = [...prev.taskOptions];
                // Determine forced type based on index (0-3 Kill, 4-7 Collect)
                const forcedType = index < 4 ? 'kill' : 'collect';
                newOptions[index] = generateSingleTask(prev.level, forcedType);
                
                return {
                    ...prev,
                    gold: prev.gold - cost,
                    taskOptions: newOptions
                };
            });
        },
        claimTaskReward: (taskUuid: string) => {
            updatePlayerState(prev => {
                const taskIndex = prev.taskOptions.findIndex(t => t.uuid === taskUuid);
                if (taskIndex === -1) return prev;
                
                const task = prev.taskOptions[taskIndex];
                let isComplete = false;

                if (task.type === 'collect') {
                    const currentQty = prev.inventory[task.targetId] || 0;
                    if (currentQty >= task.amountRequired) isComplete = true;
                } else {
                    if (task.killsCurrent >= task.killsRequired) isComplete = true;
                }

                if (!isComplete) return prev;

                let newInv = { ...prev.inventory };
                
                // REMOVE ITEMS FOR COLLECTION TASKS
                if (task.type === 'collect') {
                    newInv[task.targetId] -= task.amountRequired;
                    if (newInv[task.targetId] <= 0) delete newInv[task.targetId];
                }

                // Replace completed task with a new one of same type
                const newOptions = [...prev.taskOptions];
                newOptions[taskIndex] = generateSingleTask(prev.level, task.category);

                return { 
                    ...prev, 
                    inventory: newInv,
                    gold: prev.gold + task.rewardGold, 
                    currentXp: prev.currentXp + task.rewardXp, 
                    taskOptions: newOptions
                };
            });
            addLog("Task Reward Claimed! New contract posted.", 'gain');
        },
        ascend: () => {
            // FORCE STOP ANY ACTIVITY BEFORE RESETTING TO AVOID BUG
            resetCombatState();
            monsterHpRef.current = 0;
            setCurrentMonsterHp(0);
            setActiveMonster(undefined);

            updatePlayerState(prev => {
                if (prev.level < 50) return prev; // Requirement Lvl 50
                const points = calculateSoulPointsToGain(prev);
                
                // Keep Rare+ Items
                const recoveredUnique: Item[] = [...prev.uniqueInventory];
                
                Object.values(prev.equipment).forEach(item => {
                    if (!item) return;
                    if (item.uniqueId) {
                        recoveredUnique.push(item);
                    }
                });

                // --- RESET TO LEVEL 8 (KEEP VOCATION) ---
                const newLevel = 8;
                const keptVocation = prev.vocation;

                // Calculate HP/Mana for Level 8 based on Vocation
                // Base at Level 1: 150 HP, 35 Mana
                // Gains over 7 levels (2 to 8)
                let newHp = 150;
                let newMana = 35;
                const levelsToGain = newLevel - 1; // 7

                if (keptVocation === Vocation.KNIGHT) { newHp += levelsToGain * 15; newMana += levelsToGain * 5; }
                else if (keptVocation === Vocation.PALADIN) { newHp += levelsToGain * 10; newMana += levelsToGain * 15; }
                else if (keptVocation === Vocation.SORCERER || keptVocation === Vocation.DRUID) { newHp += levelsToGain * 5; newMana += levelsToGain * 30; }
                else { newHp += levelsToGain * 5; newMana += levelsToGain * 5; } // Fallback/None

                // Calculate Max XP for Level 8 -> 9
                const xpForNext = getXpForLevel(newLevel + 1) - getXpForLevel(newLevel);

                return {
                    ...INITIAL_PLAYER_STATS, 
                    name: prev.name,
                    
                    // NEW STATE
                    level: newLevel,
                    vocation: keptVocation,
                    isNameChosen: true, // Skip oracle
                    promoted: false, // Reset promotion status (optional, but standard for resets)
                    
                    hp: newHp, maxHp: newHp,
                    mana: newMana, maxMana: newMana,
                    
                    currentXp: 0,
                    maxXp: xpForNext,

                    // KEEP THESE ACCOUNT PROGRESSIONS
                    relics: prev.relics,
                    ascension: prev.ascension,
                    tibiaCoins: prev.tibiaCoins,
                    premiumUntil: prev.premiumUntil,
                    xpBoostUntil: prev.xpBoostUntil,
                    soulPoints: prev.soulPoints + points,
                    
                    // RESET ACTIVITY STATE
                    activeHuntId: null,
                    activeHuntCount: 1,
                    activeHuntStartTime: 0, 
                    activeTrainingSkill: null,
                    activeTrainingStartTime: 0, 

                    // HARD RESET ECONOMY but Keep Rare Gear
                    gold: 0,
                    bankGold: 0,
                    inventory: {}, // Standard loot wiped
                    uniqueInventory: recoveredUnique, // Keeps all rares + equipped rares
                    equipment: {}, // UNEQUIP ALL
                    
                    depot: {}, // Wipe depot (standard items)
                    uniqueDepot: prev.uniqueDepot, // Keep unique depot items!
                    
                    // Keep tutorial state
                    tutorials: prev.tutorials,
                };
            });
            addLog("ASCENSION! Reborn at Lvl 8 with Vocation kept. Rare items saved.", 'gain');
        },
        upgradeAscension: (perk: AscensionPerk) => {
            updatePlayerState(prev => {
                const currentLvl = prev.ascension[perk];
                // Update cost calculation here to support scaling
                const cost = getAscensionUpgradeCost(perk, currentLvl);
                
                if (prev.soulPoints < cost) return prev;
                return {
                    ...prev,
                    soulPoints: prev.soulPoints - cost,
                    ascension: { ...prev.ascension, [perk]: currentLvl + 1 }
                };
            });
            addLog("Soul Power upgraded.", 'magic');
        },
        activatePrey: (slotIndex: number) => {
            updatePlayerState(prev => {
                const newSlots = [...prev.prey.slots];
                const slot = newSlots[slotIndex];
                
                if (slot.active || (slot.startTime > 0)) return prev; // Already active or expired
                
                slot.active = true;
                slot.startTime = Date.now();
                slot.duration = 2 * 60 * 60 * 1000; // 2 hours
                
                return {
                    ...prev,
                    prey: { ...prev.prey, slots: newSlots }
                };
            });
            addLog("Prey activated for 2 hours.", 'info');
        },
        cancelPrey: (slotIndex: number) => {
            updatePlayerState(prev => {
                const newSlots = [...prev.prey.slots];
                const slot = newSlots[slotIndex];
                
                if (!slot.active) return prev;
                
                slot.active = false;
                // Leave startTime unchanged so it is considered Expired, needing a reroll
                
                return {
                    ...prev,
                    prey: { ...prev.prey, slots: newSlots }
                };
            });
            addLog("Prey bonus cancelled.", 'info');
        },
        rerollPrey: (slotIndex: number) => {
            updatePlayerState(prev => {
                // Priority: Free Rerolls > Gold
                const hasFreeReroll = prev.prey.rerollsAvailable > 0;
                const cost = hasFreeReroll ? 0 : prev.level * 100;
                
                if (!hasFreeReroll && prev.gold < cost) return prev;
                
                const newSlots = [...prev.prey.slots];
                newSlots[slotIndex] = generatePreyCard(); // Generate completely new card (resetting active/time)
                
                const newRerollCount = hasFreeReroll ? prev.prey.rerollsAvailable - 1 : prev.prey.rerollsAvailable;
                const newGold = hasFreeReroll ? prev.gold : prev.gold - cost;

                return {
                    ...prev,
                    gold: newGold,
                    prey: { ...prev.prey, slots: newSlots, rerollsAvailable: newRerollCount }
                };
            });
            addLog("Prey slot rerolled.", 'info');
        },
        claimQuest: (questId: string) => {
            updatePlayerState(prev => {
                const q = QUESTS.find(q => q.id === questId);
                if (!q || prev.quests[questId]?.completed) return prev;
                
                let newGold = prev.gold + (q.rewardGold || 0);
                let newXp = prev.currentXp + (q.rewardExp || 0);
                let newInv = { ...prev.inventory };
                
                if (q.rewardItems) {
                    q.rewardItems.forEach(ri => {
                        newInv[ri.itemId] = (newInv[ri.itemId] || 0) + ri.count;
                    });
                }
                
                return {
                    ...prev,
                    gold: newGold,
                    currentXp: newXp,
                    inventory: newInv,
                    quests: { ...prev.quests, [questId]: { ...prev.quests[questId], completed: true } }
                };
            });
            addLog("Quest Reward Claimed!", 'gain');
        },
        gmLevelUp: () => updatePlayerState(p => ({ ...p, level: p.level + 1 })),
        gmSkillUp: () => updatePlayerState(p => {
            const newSkills = { ...p.skills };
            Object.keys(newSkills).forEach(k => { newSkills[k as SkillType].level += 5; });
            return { ...p, skills: newSkills };
        }),
        gmAddGold: () => updatePlayerState(p => ({ ...p, gold: p.gold + 1000000 })),
        gmAddSoulPoints: () => updatePlayerState(p => ({ ...p, soulPoints: p.soulPoints + 1000 })),
        gmSetHazardLevel: (val: number) => updatePlayerState(p => ({ ...p, hazardLevel: val })),
        gmSetRarity: (rarity: GmFlags['forceRarity']) => updatePlayerState(p => ({ 
            ...p, 
            gmExtra: { ...p.gmExtra, forceRarity: rarity } 
        })),
        chooseName: (newName: string) => {
            updatePlayerState(p => ({ ...p, name: newName, isNameChosen: true }));
            setIsPaused(false); // Unpause game
        },
        chooseVocation: (voc: Vocation) => {
            updatePlayerState(p => {
                const newEquip = { ...p.equipment };
                const newInv = { ...p.inventory };
                const newUniqueInv = [...(p.uniqueInventory || [])];

                // Helper to safely swap item to backpack
                const grantItem = (itemId: string, count: number = 1) => {
                    const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                    if (!itemDef || !itemDef.slot) return;

                    // CHECK EXISTING ITEM IN SLOT
                    const existingItem = newEquip[itemDef.slot];
                    if (existingItem) {
                        // Move existing to backpack
                        if (existingItem.uniqueId) {
                            newUniqueInv.push(existingItem);
                        } else {
                            newInv[existingItem.id] = (newInv[existingItem.id] || 0) + (existingItem.count || 1);
                        }
                    }

                    // EQUIP NEW ITEM
                    newEquip[itemDef.slot] = { ...itemDef, count };
                };

                if (voc === Vocation.KNIGHT) grantItem('sword');
                else if (voc === Vocation.PALADIN) grantItem('spear', 5);
                else if (voc === Vocation.SORCERER) grantItem('wand_vortex');
                else if (voc === Vocation.DRUID) grantItem('snake_bite');
                
                return { 
                    ...p, 
                    vocation: voc, 
                    equipment: newEquip,
                    inventory: newInv,
                    uniqueInventory: newUniqueInv
                };
            });
            setIsPaused(false); // Unpause game
        }
    };
};
