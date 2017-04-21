var layout = function () {
    var max_slots;
    var needed_slots;

    var height = 150;
    var scale;

    var slot_types = {
        'expanded': {
            slot_height: 30,
            feature_height: 10
        },
        'collapsed': {
            slot_height: 10,
            feature_height: 7
        }
    };
    var current_slot_type = 'expanded';
    var feature_layout = function (new_features) {
        var track = this;
        scale = track.display().scale();

        max_slots = ~~(track.height() / slot_types.expanded.slot_height);
        needed_slots = collition_detector(new_features);
        slot_types.collapsed.needed_slots = needed_slots;
        slot_types.expanded.needed_slots = needed_slots;
        if (needed_slots > max_slots) {
            current_slot_type = 'collapsed';
        } else {
            current_slot_type = 'expanded';
        }

        return new_features;
    };

    function feature_slot() {
        return slot_types[current_slot_type];
    }

    function collition_detector (features) {
        var allocated = [];
        var remaining = features;
        var needed_slots = 0;

        for (var i=0; i<remaining.length; i++) {
            var features_by_slot = sort_features_by_slot(allocated);
            var current = remaining[i];
            var slot = 0;
            OUTER: while (true) {
                if (slot_has_space(current, features_by_slot[slot])) {
                    current.slot = slot;
                    allocated.push(current);
                    if (slot > needed_slots) {
                        needed_slots = slot;
                    }
                    break;
                }
                slot++;
            }
        }
        return needed_slots + 1;
    }

    function slot_has_space (feature, features_in_slot) {
        if (!features_in_slot) {
            return true;
        }
        for (var i=0; i<features_in_slot.length; i++) {
            var subject = features_in_slot[i];
            var y1 = scale(subject.start);
            var y2 = scale(subject.end);
            var x1 = scale(feature.start);
            var x2 = scale(feature.end);

            if ( ((x1 <= y1) && (x2 >= y1)) ||
            ((x1 >= y1) && (x1 <= y2)) ) {
                return false;
            }
        }
        return true;
    }

    function sort_features_by_slot (features) {
        var slots = [];
        for (var i=0; i<features.length; i++) {
            var feature = features[i];
            if (!slots[feature.slot]) {
                slots[feature.slot] = [];
            }
            slots[feature.slot].push(feature);
        }
        return slots;
    }

    feature_layout.elements = function () {};
    feature_layout.slots = function () {
        return needed_slots;
    };

    return feature_layout;
};
