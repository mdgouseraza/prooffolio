from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

def validate_institutional_email(value: str) -> str:
    if not value or "@" not in value:
        raise serializers.ValidationError("Please use your institutional email")
    domain = value.lower().split("@")[-1]
    ok = domain.endswith(".ac.in") or domain.endswith(".edu") or ".edu." in domain
    if not ok:
        raise serializers.ValidationError("Please use your institutional email")
    return value.lower()


class UserMeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    show_onboarding = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "phone",
            "role",
            "profile_photo",
            "college",
            "branch",
            "grad_year",
            "date_of_birth",
            "linkedin_url",
            "github_url",
            "employee_id",
            "show_onboarding",
            "last_updated",
            "must_change_password",
        )
        read_only_fields = ("id", "email", "role", "employee_id", "last_updated")

    def get_name(self, obj):
        parts = [obj.first_name, obj.last_name]
        return " ".join(p for p in parts if p).strip() or obj.email.split("@")[0]


class StudentProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(write_only=True, required=False)
    college = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "name",
            "profile_photo",
            "college",
            "branch",
            "grad_year",
            "date_of_birth",
            "linkedin_url",
            "github_url",
            "phone",
            "email",
            "show_onboarding",
        )

    def validate_branch(self, value):
        if not value:
            raise serializers.ValidationError("Branch is required.")
        return value

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        if name:
            instance.first_name = name.strip()[:150]
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["name"] = UserMeSerializer().get_name(instance)
        return data


class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "password", "name", "phone", "branch", "grad_year")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password")
        name = validated_data.pop("name", "").strip()
        user = User(
            email=validated_data["email"],
            username=validated_data["email"],
            first_name=name[:150],
            phone=validated_data.get("phone", ""),
            branch=validated_data.get("branch", ""),
            grad_year=validated_data.get("grad_year"),
            role=User.Role.STUDENT,
            college=settings.UNIVERSITY_NAME,
        )
        user.set_password(password)
        user.save()
        return user


class OTPSendSerializer(serializers.Serializer):
    target = serializers.CharField()
    channel = serializers.ChoiceField(choices=["email", "phone"])


class OTPVerifySerializer(serializers.Serializer):
    target = serializers.CharField()
    code = serializers.CharField(max_length=6)


class ForgotPasswordSerializer(serializers.Serializer):
    target = serializers.CharField()
    channel = serializers.ChoiceField(choices=["email", "phone"])


class ResetPasswordSerializer(serializers.Serializer):
    target = serializers.CharField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)


class HODCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "branch", "employee_id")

    def validate_email(self, value):
        validate_institutional_email(value)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def create(self, validated_data):
        pwd = validated_data.pop("password")
        email = validated_data.pop("email")
        user = User(
            username=email,
            email=email,
            role=User.Role.HOD,
            must_change_password=True,
            college=settings.UNIVERSITY_NAME,
            **validated_data,
        )
        user.set_password(pwd)
        user.save()
        return user
