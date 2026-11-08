with Ada.Unchecked_Conversion;

package body Ath_Delay is
   use type Status_Code;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Is_Unit (Unit : Long_Float) return Boolean is
   begin
      return Unit = Unit_Kilometres
        or else Unit = Unit_Astronomical
        or else Unit = Unit_Light_Years;
   end Is_Unit;

   procedure Propagate
     (Distance   : Long_Float;
      Unit       : Long_Float;
      One_Way    : out Long_Float;
      Round_Trip : out Long_Float;
      Status     : out Status_Code)
   is
   begin
      One_Way := 0.0;
      Round_Trip := 0.0;
      if not Is_Finite (Distance) or else not Is_Finite (Unit) then
         Status := Non_Finite_Input;
         return;
      end if;
      if not Is_Unit (Unit) then
         Status := Bad_Unit;
         return;
      end if;
      if Distance < 0.0 then
         Status := Negative;
         return;
      end if;
      if Distance = 0.0 then
         Status := Ok;
         return;
      end if;

      if Unit = Unit_Kilometres then
         One_Way := Distance * 1_000.0 / Speed_Of_Light;
      elsif Unit = Unit_Astronomical then
         One_Way := Distance * Astronomical_Unit_Metres / Speed_Of_Light;
      else
         One_Way := Distance * Julian_Year_Seconds;
      end if;
      if not Is_Finite (One_Way) then
         One_Way := 0.0;
         Status := Result_Not_Finite;
         return;
      end if;
      Round_Trip := One_Way * 2.0;
      if not Is_Finite (Round_Trip) then
         One_Way := 0.0;
         Round_Trip := 0.0;
         Status := Result_Not_Finite;
         return;
      end if;
      Status := Ok;
   end Propagate;

   function Preset_Distance (Index : Preset_Index) return Long_Float is
   begin
      case Index is
         when 1 =>
            return 384_400.0;
         when 2 =>
            return 225_000_000.0;
         when 3 =>
            return 1_000.0;
      end case;
   end Preset_Distance;

   function Preset_Unit (Index : Preset_Index) return Long_Float is
   begin
      case Index is
         when 1 | 2 =>
            return Unit_Kilometres;
         when 3 =>
            return Unit_Light_Years;
      end case;
   end Preset_Unit;
end Ath_Delay;
